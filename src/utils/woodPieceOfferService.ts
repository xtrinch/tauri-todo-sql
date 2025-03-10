import { queryOptions, useMutation } from "@tanstack/react-query";
import { info } from "@tauri-apps/plugin-log";
import { compact, keyBy } from "lodash";
import { queryClient } from "../main";
import { getDatabase, getDatabaseForModify } from "./database";

type PickAsRequired<TValue, TKey extends keyof TValue> = Omit<TValue, TKey> &
  Required<Pick<TValue, TKey>>;

export type WoodPieceOffer = {
  id: number;
  offered_price: number;
  wood_piece_id: number;
  buyer_id: number;
  duplicate_offer?: boolean;

  // from other tables
  seller_name: string;
  offered_max_price: number;
  tree_species_name: string;
  is_max_offer: boolean;
};

interface ListOptions {
  buyerId?: number;
  filterBy?: string;
  sortBy?: "name" | "id";
  sortDirection?: "DESC" | "ASC";
  language?: "en" | "sl";
  mark_duplicates?: boolean;
}

const ensureWoodPieceOffers = async (opts: ListOptions) => {
  const db = await getDatabase();
  const params = [opts.buyerId];

  const where = compact([
    opts.buyerId ? `"wood_piece_offers"."buyer_id" = $1 ` : "",
  ]);
  const sql = `
    SELECT 
      *, 
      "wood_piece_offers"."id" as id,
      "wood_piece_offers"."offered_price" as "offered_price",
      "wood_piece_offers"."buyer_id" as "buyer_id",
      ${opts.language === "sl" ? "tree_species_name_slo" : "tree_species_name"} as "tree_species_name",
      MAX("wood_piece_offers_max"."offered_price") as "offered_max_price",
      "wood_piece_offers"."offered_price" * "volume" as "offered_total_price",
      CASE WHEN "wood_piece_offers"."offered_price" >= "wood_piece_offers_max"."offered_price" AND "wood_piece_offers"."offered_price" != 0 THEN "true" ELSE "false" END as "is_max_offer"
    FROM "wood_piece_offers"
    LEFT JOIN "wood_pieces" ON "wood_piece_offers"."wood_piece_id" = "wood_pieces"."id"
    LEFT JOIN "sellers" ON "wood_pieces"."seller_id" = "sellers"."id"
    LEFT JOIN "tree_species" ON "wood_pieces"."tree_species_id" = "tree_species"."id"
    LEFT JOIN "wood_piece_offers" "wood_piece_offers_max" ON "wood_piece_offers_max"."wood_piece_id" = "wood_piece_offers"."wood_piece_id"
    ${where.length > 0 ? `WHERE ${where.join(" AND ")}` : ``}
    GROUP BY "wood_piece_offers"."id"
    ORDER BY ${opts.sortBy || "id"} ${opts.sortDirection || "ASC"}`;
  let result: WoodPieceOffer[] = [];
  try {
    result = await db.select(sql, params);
  } catch (e) {
    info(JSON.stringify(e));
    throw e;
  }
  let woodPieceOffers = result as WoodPieceOffer[];

  if (opts.mark_duplicates) {
    const duplicate_wood_pieces_sql = `SELECT "wood_piece_id", COUNT(*) c FROM "wood_piece_offers" ${where.length > 0 ? `WHERE ${where.join(" AND ")}` : ``} GROUP BY "wood_piece_id" HAVING c > 1;`;
    const duplicate_wood_pieces = (await db.select(
      duplicate_wood_pieces_sql,
      params
    )) as {
      id: number;
    }[];
    const duplicate_wood_pieces_map = keyBy(
      duplicate_wood_pieces,
      "wood_piece_id"
    );

    woodPieceOffers = woodPieceOffers.map((wp) => ({
      ...wp,
      duplicate_offer: !!duplicate_wood_pieces_map[wp.wood_piece_id],
    }));
  }

  return woodPieceOffers;
};

export async function postWoodPieceOffer(
  partialWoodPieceOffer: Partial<WoodPieceOffer>
): Promise<WoodPieceOffer> {
  const woodPiece: Partial<WoodPieceOffer> = {
    buyer_id: partialWoodPieceOffer.buyer_id,
    offered_price: 0,
    wood_piece_id: partialWoodPieceOffer.wood_piece_id,
  };

  const db = await getDatabaseForModify();
  let result;
  result = await db.execute(
    `INSERT INTO "wood_piece_offers" (
        "offered_price", 
        "wood_piece_id", 
        "buyer_id"
      ) values (
        $1, 
        $2, 
        $3
      )`,
    [woodPiece.offered_price, woodPiece.wood_piece_id, woodPiece.buyer_id]
  );

  return {
    ...woodPiece,
    id: result.lastInsertId,
  } as WoodPieceOffer;
}

export async function removeWoodPieceOffer(
  partialWoodPieceOffer: Partial<WoodPieceOffer>
): Promise<WoodPieceOffer> {
  const db = await getDatabaseForModify();
  await db.execute(`DELETE FROM "wood_piece_offers" WHERE "id" = $1`, [
    partialWoodPieceOffer.id,
  ]);
  return partialWoodPieceOffer as WoodPieceOffer;
}

export async function patchWoodPieceOffer(
  woodPiece: PickAsRequired<Partial<WoodPieceOffer>, "id">
) {
  const db = await getDatabaseForModify();
  const params = [
    woodPiece.id,
    woodPiece.wood_piece_id,
    woodPiece.offered_price,
  ];
  await db.execute(
    `UPDATE "wood_piece_offers" 
    SET 
      "wood_piece_id" = COALESCE($2, "wood_piece_id"),
      "offered_price" = COALESCE($3, "offered_price")
    WHERE id = $1`,
    params
  );
}

export const useCreateWoodPieceOfferMutation = (opts?: {
  onSuccess?: (woodPieceOffer: WoodPieceOffer) => void;
  onError?: (error: Error) => void;
}) => {
  return useMutation({
    mutationFn: postWoodPieceOffer,
    onSuccess: (woodPiece: WoodPieceOffer) => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          ["wood_piece_offers", "statistics", "wood_pieces"].includes(
            query.queryKey[0] as string
          ),
      });
      if (opts?.onSuccess) opts.onSuccess(woodPiece);
    },
    onError: (e) => {
      info(JSON.stringify(e));
      if (opts?.onError) opts.onError(e);
    },
  });
};

export const useRemoveWoodPieceOfferMutation = (opts: {
  onSuccess?: (woodPiece: WoodPieceOffer) => void;
  onError?: (error: Error) => void;
}) => {
  return useMutation({
    mutationFn: removeWoodPieceOffer,
    onSuccess: (woodPiece: WoodPieceOffer) => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          ["wood_piece_offers", "statistics", "wood_pieces"].includes(
            query.queryKey[0] as string
          ),
      });
      if (opts?.onSuccess) opts.onSuccess(woodPiece);
    },
    onError: (e) => {
      info(JSON.stringify(e));
      if (opts?.onError) opts.onError(e);
    },
  });
};

export const useUpdateWoodPieceOfferMutation = (opts?: {
  onSuccess?: () => void;
  onError?: (e: Error) => void;
}) => {
  return useMutation({
    mutationFn: patchWoodPieceOffer,
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          ["wood_piece_offers", "statistics", "wood_pieces"].includes(
            query.queryKey[0] as string
          ),
      });
      if (opts?.onSuccess) opts.onSuccess();
    },
    gcTime: 1000 * 10,
    onError: (e) => {
      info(JSON.stringify(e));
      if (opts?.onError) opts.onError(e);
    },
  });
};

export const woodPieceOffersQueryOptions = (opts: ListOptions) =>
  queryOptions({
    queryKey: ["wood_piece_offers", opts],
    queryFn: () => ensureWoodPieceOffers(opts),
    staleTime: Infinity,
  });
