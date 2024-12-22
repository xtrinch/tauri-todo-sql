import { queryOptions, useMutation } from "@tanstack/react-query";
import { info } from "@tauri-apps/plugin-log";
import { compact } from "lodash";
import { queryClient } from "../main";
import { getDatabase } from "./database";

type PickAsRequired<TValue, TKey extends keyof TValue> = Omit<TValue, TKey> &
  Required<Pick<TValue, TKey>>;

export type TreeSpecies = {
  id: number;
  name: string;
  seller_id: number;
  tree_species_id: number;
  length: number;
  width: number;
  volume: number;
  max_price: number;
  plate_no: number;
};

const ensureTreeSpeciess = async (opts: {
  sellerId?: number;
  filterBy?: string;
  sortBy?: "name" | "id" | "email";
}) => {
  const db = await getDatabase();
  const params = compact([opts.sortBy || "id", opts.sellerId]);
  const sql = `SELECT * from "tree_species" ${opts.sellerId ? `WHERE "seller_id"=$2` : ""} ORDER BY $1`;
  info(sql);
  const result = await db.select(sql, params);

  const treeSpecies = result as TreeSpecies[];
  return treeSpecies;
};

export async function fetchTreeSpeciesById(id: number) {
  const db = await getDatabase();
  const result = await db.select(`SELECT * from "tree_species" where id = $1`, [
    id,
  ]);
  const treeSpecies = (result as TreeSpecies[])[0];
  return treeSpecies;
}

export async function postTreeSpecies(
  partialTreeSpecies: Partial<TreeSpecies>
): Promise<TreeSpecies> {
  if (partialTreeSpecies.name?.includes("error")) {
    throw new Error("Ouch!");
  }

  const treeSpecies: Partial<TreeSpecies> = {
    name:
      partialTreeSpecies.name ??
      `New TreeSpecies ${String(Date.now()).slice(0, 5)}`,
  };

  const db = await getDatabase();
  info(`${partialTreeSpecies.seller_id}`);
  const result = await db.execute(
    `INSERT INTO "tree_species" ("length", "width", "max_price", "plate_no", "seller_id") values ($1, $2, $3, $4, $5)`,
    [0, 0, 0, 0, partialTreeSpecies.seller_id]
  );
  info(JSON.stringify(result));

  return {
    ...treeSpecies,
    id: result.lastInsertId,
  } as TreeSpecies;
}

export async function removeTreeSpecies(
  partialTreeSpecies: Partial<TreeSpecies>
): Promise<TreeSpecies> {
  const db = await getDatabase();
  await db.execute(`DELETE FROM "tree_species" WHERE "id" = $1`, [
    partialTreeSpecies.id,
  ]);

  return partialTreeSpecies as TreeSpecies;
}

export async function patchTreeSpecies(
  treeSpecies: PickAsRequired<Partial<TreeSpecies>, "id">
) {
  const db = await getDatabase();
  await db.execute(
    `UPDATE "tree_species" SET "width" = COALESCE($2, "width"), "length"=COALESCE($3, "length"), "max_price"=COALESCE($4, "max_price"), "plate_no"=COALESCE($5, "plate_no")  WHERE id=$1`,
    [
      treeSpecies.id,
      treeSpecies.width,
      treeSpecies.length,
      treeSpecies.max_price,
      treeSpecies.plate_no,
    ]
  );
}

export const useCreateTreeSpeciesMutation = (
  onSuccess?: (treeSpecies: TreeSpecies) => void
) => {
  return useMutation({
    mutationFn: postTreeSpecies,
    onSuccess: (treeSpecies: TreeSpecies) => {
      queryClient.invalidateQueries();
      if (onSuccess) onSuccess(treeSpecies);
    },
  });
};

export const useRemoveTreeSpeciesMutation = (
  onSuccess?: (treeSpecies: TreeSpecies) => void
) => {
  return useMutation({
    mutationFn: removeTreeSpecies,
    onSuccess: (treeSpecies: TreeSpecies) => {
      queryClient.invalidateQueries();
      if (onSuccess) onSuccess(treeSpecies);
    },
  });
};

export const useUpdateTreeSpeciesMutation = (onSuccess?: () => void) => {
  return useMutation({
    // mutationKey: ["tree_species", "update"],
    mutationFn: patchTreeSpecies,
    onSuccess: () => {
      queryClient.invalidateQueries();
      if (onSuccess) onSuccess();
    },
    gcTime: 1000 * 10,
  });
};

export const treeSpeciesQueryOptions = (opts: {
  filterBy?: string;
  sortBy?: "name" | "id" | "email";
}) =>
  queryOptions({
    queryKey: ["tree_species", opts],
    queryFn: () => ensureTreeSpeciess(opts),
  });
