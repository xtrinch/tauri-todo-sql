import { queryOptions, useMutation } from "@tanstack/react-query";
import { info } from "@tauri-apps/plugin-log";
import { compact } from "lodash";
import { queryClient } from "../main";
import { getDatabase, getDatabaseForModify } from "./database";

type PickAsRequired<TValue, TKey extends keyof TValue> = Omit<TValue, TKey> &
  Required<Pick<TValue, TKey>>;

export type WoodPiece = {
  id: number;
  wood_piece_name: string;
  seller_id: number;
  tree_species_id: number;
  length: number;
  width: number;
  volume: number;
  plate_no: number;
  sequence_no: number;
  min_price?: number;

  // from other tables
  offered_total_price: number;
  seller_name: string;
  tree_species_name: string;
  offered_price: number;
  buyer_name: string;
};

interface ListOptions {
  tree_species_id?: number;
  seller_id?: number;
  buyer_id?: number;
  offered_price__isnull?: boolean;
  offered_price__isnotnull?: boolean;
  filterBy?: string;
  sortBy?: "id" | "sequence_no";
  relations?: string[];
  sortDirection?: "DESC" | "ASC";
  language?: "en" | "sl";
}

const ensureWoodPieces = async (opts: ListOptions) => {
  const db = await getDatabase();
  const params = [opts.seller_id, opts.tree_species_id, opts.buyer_id];

  const where = compact([
    opts.seller_id ? `"seller_id" = $1 ` : "",
    opts.tree_species_id ? `"tree_species_id" = $2` : "",
    opts.offered_price__isnull ? `"offered_price" IS NULL` : "",
    opts.offered_price__isnotnull ? `"offered_price" IS NOT NULL` : "",
  ]);

  let sql = `
    SELECT 
      *, 
      "wood_pieces".id as id,
      "offered_price" * "volume" as "offered_total_price",
      MAX("wood_piece_offers"."offered_price") as "offered_price",
      ${opts.language === "sl" ? "tree_species_name_slo" : "tree_species_name"} as "tree_species_name"
    FROM "wood_pieces"
    LEFT JOIN "tree_species" ON "wood_pieces"."tree_species_id" = "tree_species"."id"
    LEFT JOIN "sellers" ON "wood_pieces"."seller_id" = "sellers"."id"
    LEFT JOIN "wood_piece_offers" ON "wood_pieces"."id" = "wood_piece_offers"."wood_piece_id"
    LEFT JOIN "buyers" ON "wood_piece_offers"."buyer_id" = "buyers"."id"
    ${where.length > 0 ? `WHERE ${where.join(" AND ")}` : ``}
    GROUP BY "wood_pieces"."id"
    ORDER BY ${opts.sortBy || "sequence_no"} ${opts.sortDirection || "ASC"}`;

  if (opts.buyer_id) {
    sql = `SELECT * FROM (${sql}) WHERE "buyer_id" = $3`;
  }
  let result: WoodPiece[] = [];
  try {
    result = (await db.select(sql, params)) as WoodPiece[];
  } catch (e) {
    info(JSON.stringify(e));
    throw e;
  }
  const woodPieces = result as WoodPiece[];
  return woodPieces;
};

export async function fetchWoodPieceById(id: number) {
  const db = await getDatabase();
  const result = await db.select(`SELECT * from "wood_pieces" where id = $1`, [
    id,
  ]);
  const woodPiece = (result as WoodPiece[])[0];
  return woodPiece;
}

export async function postWoodPiece(
  partialWoodPiece: Partial<WoodPiece>
): Promise<WoodPiece> {
  if (partialWoodPiece.wood_piece_name?.includes("error")) {
    throw new Error("Ouch!");
  }

  const woodPiece: Partial<WoodPiece> = {
    wood_piece_name:
      partialWoodPiece.wood_piece_name ??
      `New WoodPiece ${String(Date.now()).slice(0, 5)}`,
  };

  const db = await getDatabaseForModify();
  let result;
  result = await db.execute(
    `INSERT INTO "wood_pieces" (
      "length", 
      "width", 
      "plate_no", 
      "seller_id",
      "sequence_no",
      "min_price"
    ) values (
      $1, 
      $2, 
      $3, 
      $4, 
      (SELECT COALESCE(MAX("sequence_no"),0)+1 FROM "wood_pieces"),
      $6
    )`,
    [0, 0, "", partialWoodPiece.seller_id, 0]
  );

  return {
    ...woodPiece,
    id: result.lastInsertId,
  } as WoodPiece;
}

export async function removeWoodPiece(
  partialWoodPiece: Partial<WoodPiece>
): Promise<WoodPiece> {
  const db = await getDatabaseForModify();
  await db.execute(`DELETE FROM "wood_pieces" WHERE "id" = $1`, [
    partialWoodPiece.id,
  ]);

  return partialWoodPiece as WoodPiece;
}

export async function patchWoodPiece(
  woodPiece: PickAsRequired<Partial<WoodPiece>, "id">
) {
  const db = await getDatabaseForModify();
  await db.execute(
    `UPDATE "wood_pieces" 
    SET 
      "width" = COALESCE($2, "width"), 
      "length" = COALESCE($3, "length"), 
      "plate_no" = COALESCE($4, "plate_no"),
      "tree_species_id" = COALESCE($5, "tree_species_id"),
      "sequence_no" = COALESCE($6, "sequence_no"),
      "seller_id" = COALESCE($7, "seller_id"),
      "min_price" = COALESCE($8, "min_price")
    WHERE id=$1`,
    [
      woodPiece.id,
      woodPiece.width,
      woodPiece.length,
      woodPiece.plate_no,
      woodPiece.tree_species_id,
      woodPiece.sequence_no,
      woodPiece.seller_id,
      woodPiece.min_price,
    ]
  );
}

export const woodPieceQueryOptions = (woodPieceId: number) =>
  queryOptions({
    queryKey: ["wood_pieces", woodPieceId],
    queryFn: () => fetchWoodPieceById(woodPieceId),
    staleTime: Infinity,
  });

export const useCreateWoodPieceMutation = (opts?: {
  onSuccess?: (buyer: WoodPiece) => void;
  onError?: (error: Error) => void;
}) => {
  return useMutation({
    mutationFn: postWoodPiece,
    onSuccess: (woodPiece: WoodPiece) => {
      queryClient.invalidateQueries({ queryKey: ["wood_pieces"] });
      if (opts?.onSuccess) opts.onSuccess(woodPiece);
    },
    onError: (e) => {
      info(JSON.stringify(e));
    },
  });
};

export const useRemoveWoodPieceMutation = (opts?: {
  onSuccess?: (woodPiece: WoodPiece) => void;
  onError?: () => void;
}) => {
  return useMutation({
    mutationFn: removeWoodPiece,
    onSuccess: (woodPiece: WoodPiece) => {
      queryClient.invalidateQueries({ queryKey: ["wood_pieces"] });
      if (opts?.onSuccess) opts.onSuccess(woodPiece);
    },
    onError: (e) => {
      info(JSON.stringify(e));
      if (opts?.onError) opts.onError();
    },
  });
};

export const useUpdateWoodPieceMutation = (opts?: {
  onSuccess?: () => void;
  onError?: (e: Error) => void;
}) => {
  return useMutation({
    mutationFn: patchWoodPiece,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wood_pieces"] });
      if (opts?.onSuccess) opts.onSuccess();
    },
    gcTime: 1000 * 10,
    onError: (e) => {
      info(JSON.stringify(e));
      if (opts?.onError) opts.onError(e);
    },
  });
};

export const woodPiecesQueryOptions = (opts: ListOptions) =>
  queryOptions({
    queryKey: ["wood_pieces", opts],
    queryFn: () => ensureWoodPieces(opts),
    staleTime: Infinity,
  });
