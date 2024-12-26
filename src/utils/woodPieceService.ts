import { queryOptions, useMutation } from "@tanstack/react-query";
import { info } from "@tauri-apps/plugin-log";
import { queryClient } from "../main";
import { getDatabase } from "./database";

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

  // from other tables
  seller_name: string;
  tree_species_name: string;
  offered_price: number;
  buyer_name: string;
};

const ensureWoodPieces = async (opts: {
  sellerId?: number;
  filterBy?: string;
  sortBy?: "id" | "sequence_no";
  relations?: string[];
  sortDirection?: "DESC" | "ASC";
}) => {
  const db = await getDatabase();
  const params = [opts.sellerId];
  const sql = `
    SELECT 
      *, 
      "wood_pieces".id as id
    FROM "wood_pieces"
    LEFT JOIN "tree_species" ON "wood_pieces"."tree_species_id" = "tree_species"."id"
    LEFT JOIN "sellers" ON "wood_pieces"."seller_id" = "sellers"."id"
    LEFT JOIN "wood_piece_offers" ON "wood_pieces"."id" = "wood_piece_offers"."wood_piece_id"
    LEFT JOIN "buyers" ON "wood_piece_offers"."buyer_id" = "buyers"."id"
    ${
      opts.sellerId
        ? `WHERE "seller_id" = $1 AND ("wood_piece_offers"."offered_price" IS NULL OR "wood_piece_offers"."offered_price" = (
        SELECT
          MAX("wood_piece_offers"."offered_price")
        FROM
          "wood_piece_offers"
        WHERE
          "wood_piece_offers"."wood_piece_id" = "wood_pieces"."id"))`
        : ``
    }
    GROUP BY "wood_pieces"."id"
    ORDER BY ${opts.sortBy || "sequence_no"} ${opts.sortDirection || "ASC"}`;
  const result = (await db.select(sql, params)) as WoodPiece[];
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

  const db = await getDatabase();
  const result = await db.execute(
    `INSERT INTO "wood_pieces" (
      "length", 
      "width", 
      "plate_no", 
      "seller_id",
      "sequence_no"
    ) values (
      $1, 
      $2, 
      $3, 
      $4, 
      (SELECT COALESCE(MAX("sequence_no"),0)+1 FROM "wood_pieces")
    )`,
    [0, 0, 0, partialWoodPiece.seller_id]
  );

  return {
    ...woodPiece,
    id: result.lastInsertId,
  } as WoodPiece;
}

export async function removeWoodPiece(
  partialWoodPiece: Partial<WoodPiece>
): Promise<WoodPiece> {
  const db = await getDatabase();
  await db.execute(`DELETE FROM "wood_pieces" WHERE "id" = $1`, [
    partialWoodPiece.id,
  ]);

  return partialWoodPiece as WoodPiece;
}

export async function patchWoodPiece(
  woodPiece: PickAsRequired<Partial<WoodPiece>, "id">
) {
  const db = await getDatabase();
  try {
    await db.execute(
      `UPDATE "wood_pieces" 
    SET 
      "width" = COALESCE($2, "width"), 
      "length" = COALESCE($3, "length"), 
      "plate_no" = COALESCE($4, "plate_no"),
      "tree_species_id" = COALESCE($5, "tree_species_id"),
      "sequence_no" = COALESCE($6, "sequence_no")
    WHERE id=$1`,
      [
        woodPiece.id,
        woodPiece.width,
        woodPiece.length,
        woodPiece.plate_no,
        woodPiece.tree_species_id,
        woodPiece.sequence_no,
      ]
    );
  } catch (e) {
    info(JSON.stringify(e));
  }
}

export const woodPieceQueryOptions = (woodPieceId: number) =>
  queryOptions({
    queryKey: ["wood_pieces", woodPieceId],
    queryFn: () => fetchWoodPieceById(woodPieceId),
  });

export const useCreateWoodPieceMutation = (
  onSuccess?: (woodPiece: WoodPiece) => void
) => {
  return useMutation({
    mutationFn: postWoodPiece,
    onSuccess: (woodPiece: WoodPiece) => {
      queryClient.invalidateQueries({ queryKey: ["wood_pieces"] });
      if (onSuccess) onSuccess(woodPiece);
    },
  });
};

export const useRemoveWoodPieceMutation = (
  onSuccess?: (woodPiece: WoodPiece) => void
) => {
  return useMutation({
    mutationFn: removeWoodPiece,
    onSuccess: (woodPiece: WoodPiece) => {
      queryClient.invalidateQueries({ queryKey: ["wood_pieces"] });
      if (onSuccess) onSuccess(woodPiece);
    },
  });
};

export const useUpdateWoodPieceMutation = (onSuccess?: () => void) => {
  return useMutation({
    mutationFn: patchWoodPiece,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wood_pieces"] });
      if (onSuccess) onSuccess();
    },
    gcTime: 1000 * 10,
  });
};

export const woodPiecesQueryOptions = (opts: {
  sellerId?: number;
  filterBy?: string;
  sortBy?: "id" | "sequence_no";
  relations?: string[];
}) =>
  queryOptions({
    queryKey: ["wood_pieces", opts],
    queryFn: () => ensureWoodPieces(opts),
  });
