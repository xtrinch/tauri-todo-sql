import { queryOptions, useMutation } from "@tanstack/react-query";
import { info } from "@tauri-apps/plugin-log";
import { queryClient } from "../main";
import { getDatabase } from "./database";

type PickAsRequired<TValue, TKey extends keyof TValue> = Omit<TValue, TKey> &
  Required<Pick<TValue, TKey>>;

export type WoodPiece = {
  id: number;
  name: string;
  sellerId: number;
  length: number;
  width: number;
  volume: number;
  max_price: number;
  plate_no: number;
};

const ensureWoodPieces = async (opts: {
  sellerId?: number;
  filterBy?: string;
  sortBy?: "name" | "id" | "email";
}) => {
  const db = await getDatabase();
  const params = [opts.sortBy || "id", opts.sellerId].filter((val) => !!val); // TODO: lodash
  const sql = `SELECT * from "wood_pieces" ${opts.sellerId ? `WHERE "seller_id"=$2` : ""} ORDER BY $1`;
  info(sql);
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
  info(`${partialWoodPiece.sellerId}`);
  const result = await db.execute(
    `INSERT INTO "wood_pieces" ("length", "width", "max_price", "plate_no", "seller_id") values ($1, $2, $3, $4, $5)`,
    [0, 0, 0, 0, partialWoodPiece.sellerId]
  );
  info(JSON.stringify(result));

  return {
    ...woodPiece,
    id: result.lastInsertId,
  } as WoodPiece;
}

export async function removeWoodPiece(
  partialWoodPiece: Partial<WoodPiece>
): Promise<WoodPiece> {
  const db = await getDatabase();
  info("ID:::::::");
  await db.execute(`DELETE FROM "wood_pieces" WHERE "id" = $1`, [
    partialWoodPiece.id,
  ]);

  return partialWoodPiece as WoodPiece;
}

export async function patchWoodPiece(
  woodPiece: PickAsRequired<Partial<WoodPiece>, "id">
) {
  info(`UPDATING... wth ${JSON.stringify(woodPiece)}`);
  const db = await getDatabase();
  await db.execute(`UPDATE "wood_pieces" SET "width" = $2 WHERE id=$1`, [
    woodPiece.id,
    woodPiece.width,
  ]);
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
      queryClient.invalidateQueries();
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
      queryClient.invalidateQueries();
      if (onSuccess) onSuccess(woodPiece);
    },
  });
};

export const useUpdateWoodPieceMutation = (onSuccess?: () => void) => {
  return useMutation({
    // mutationKey: ["wood_pieces", "update"],
    mutationFn: patchWoodPiece,
    onSuccess: () => {
      queryClient.invalidateQueries();
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
