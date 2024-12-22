import { queryOptions, useMutation } from "@tanstack/react-query";
import { compact } from "lodash";
import { queryClient } from "../main";
import { getDatabase } from "./database";

type PickAsRequired<TValue, TKey extends keyof TValue> = Omit<TValue, TKey> &
  Required<Pick<TValue, TKey>>;

export type WoodPiece = {
  id: number;
  name: string;
  seller_id: number;
  tree_species_id: number;
  length: number;
  width: number;
  volume: number;
  max_price: number;
  plate_no: number;
  sequence_no: number;
};

const ensureWoodPieces = async (opts: {
  sellerId?: number;
  filterBy?: string;
  sortBy?: "name" | "id" | "email";
}) => {
  const db = await getDatabase();
  const params = compact([opts.sortBy || "id", opts.sellerId]);
  const sql = `
    SELECT *, "wood_pieces".id as id from "wood_pieces" 
    LEFT JOIN "tree_species" ON "wood_pieces"."tree_species_id"="tree_species"."id"
    ${opts.sellerId ? `WHERE "seller_id"=$2` : ""}
    ORDER BY $1`;
  const result = await db.select(sql, params);

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
  if (partialWoodPiece.name?.includes("error")) {
    throw new Error("Ouch!");
  }

  const woodPiece: Partial<WoodPiece> = {
    name:
      partialWoodPiece.name ??
      `New WoodPiece ${String(Date.now()).slice(0, 5)}`,
  };

  const db = await getDatabase();
  const result = await db.execute(
    `INSERT INTO "wood_pieces" (
      "length", 
      "width", 
      "max_price", 
      "plate_no", 
      "seller_id",
      "sequence_no"
    ) values (
      $1, 
      $2, 
      $3, 
      $4, 
      $5,
      $6
    )`,
    [0, 0, 0, 0, partialWoodPiece.seller_id, 1]
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
  await db.execute(
    `UPDATE "wood_pieces" 
    SET 
      "width" = COALESCE($2, "width"), 
      "length" = COALESCE($3, "length"), 
      "max_price" = COALESCE($4, "max_price"), 
      "plate_no" = COALESCE($5, "plate_no"),
      "tree_species_id" = COALESCE($6, "tree_species_id"),
      "sequence_no" = COALESCE($7, "sequence_no")
    WHERE id=$1`,
    [
      woodPiece.id,
      woodPiece.width,
      woodPiece.length,
      woodPiece.max_price,
      woodPiece.plate_no,
      woodPiece.tree_species_id,
      woodPiece.sequence_no,
    ]
  );
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
  sortBy?: "name" | "id" | "email";
}) =>
  queryOptions({
    queryKey: ["wood_pieces", opts],
    queryFn: () => ensureWoodPieces(opts),
  });
