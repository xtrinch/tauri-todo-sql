import { queryOptions, useMutation } from "@tanstack/react-query";
import { compact } from "lodash";
import { queryClient } from "../main";
import { getDatabase } from "./database";

type PickAsRequired<TValue, TKey extends keyof TValue> = Omit<TValue, TKey> &
  Required<Pick<TValue, TKey>>;

export type WoodPieceOffer = {
  id: number;
  offered_price: number;
  wood_piece_id: number;
  buyer_id: number;

  // from other tables
  seller_name: string;
};

const ensureWoodPieceOffers = async (opts: {
  buyerId?: number;
  filterBy?: string;
  sortBy?: "name" | "id" | "email";
}) => {
  const db = await getDatabase();
  const params = compact([opts.sortBy || "id", opts.buyerId]);
  const sql = `
    SELECT *, "wood_piece_offers".id as id from "wood_piece_offers" 
    LEFT JOIN "wood_pieces" ON "wood_piece_offers"."wood_piece_id" = "wood_pieces"."id"
    LEFT JOIN "sellers" ON "wood_pieces"."seller_id" = "sellers"."id"
    LEFT JOIN "tree_species" ON "wood_pieces"."tree_species_id" = "tree_species"."id"
    ${opts.buyerId ? `WHERE "buyer_id" = $2` : ""}
    ORDER BY $1`;
  const result = await db.select(sql, params);

  const woodPieces = result as WoodPieceOffer[];
  return woodPieces;
};

export async function fetchWoodPieceOfferById(id: number) {
  const db = await getDatabase();
  const result = await db.select(`SELECT * from "wood_pieces" where id = $1`, [
    id,
  ]);
  const woodPiece = (result as WoodPieceOffer[])[0];
  return woodPiece;
}

export async function postWoodPieceOffer(
  partialWoodPieceOffer: Partial<WoodPieceOffer>
): Promise<WoodPieceOffer> {
  const woodPiece: Partial<WoodPieceOffer> = {
    buyer_id: partialWoodPieceOffer.buyer_id,
    offered_price: 0,
    wood_piece_id: partialWoodPieceOffer.wood_piece_id,
  };

  const db = await getDatabase();
  const result = await db.execute(
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
  const db = await getDatabase();
  await db.execute(`DELETE FROM "wood_pieces" WHERE "id" = $1`, [
    partialWoodPieceOffer.id,
  ]);
  return partialWoodPieceOffer as WoodPieceOffer;
}

export async function patchWoodPieceOffer(
  woodPiece: PickAsRequired<Partial<WoodPieceOffer>, "id">
) {
  const db = await getDatabase();
  await db.execute(
    `UPDATE "wood_piece_offers" 
    SET 
      "wood_piece_id" = COALESCE($2, "wood_piece_id"),
      "offered_price" = COALESCE($3, "offered_price") 
      ---"length" = COALESCE($3, "length"), 
      ---"plate_no" = COALESCE($5, "plate_no")
    WHERE id=$1`,
    [woodPiece.id, woodPiece.wood_piece_id, woodPiece.offered_price]
  );
}

export const woodPieceQueryOptions = (woodPieceId: number) =>
  queryOptions({
    queryKey: ["wood_pieces", woodPieceId],
    queryFn: () => fetchWoodPieceOfferById(woodPieceId),
  });

export const useCreateWoodPieceOfferMutation = (
  onSuccess?: (woodPiece: WoodPieceOffer) => void
) => {
  return useMutation({
    mutationFn: postWoodPieceOffer,
    onSuccess: (woodPiece: WoodPieceOffer) => {
      queryClient.invalidateQueries({ queryKey: ["wood_pieces"] });
      if (onSuccess) onSuccess(woodPiece);
    },
  });
};

export const useRemoveWoodPieceOfferMutation = (
  onSuccess?: (woodPiece: WoodPieceOffer) => void
) => {
  return useMutation({
    mutationFn: removeWoodPieceOffer,
    onSuccess: (woodPiece: WoodPieceOffer) => {
      queryClient.invalidateQueries({ queryKey: ["wood_pieces"] });
      if (onSuccess) onSuccess(woodPiece);
    },
  });
};

export const useUpdateWoodPieceOfferMutation = (onSuccess?: () => void) => {
  return useMutation({
    mutationFn: patchWoodPieceOffer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wood_pieces"] });
      if (onSuccess) onSuccess();
    },
    gcTime: 1000 * 10,
  });
};

export const woodPieceOffersQueryOptions = (opts: {
  sellerId?: number;
  filterBy?: string;
  sortBy?: "name" | "id" | "email";
}) =>
  queryOptions({
    queryKey: ["wood_pieces", opts],
    queryFn: () => ensureWoodPieceOffers(opts),
  });
