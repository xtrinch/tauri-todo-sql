import { queryOptions, useMutation } from "@tanstack/react-query";
import { compact } from "lodash";
import { queryClient } from "../main";
import { getDatabase, getDatabaseForModify } from "./database";

type PickAsRequired<TValue, TKey extends keyof TValue> = Omit<TValue, TKey> &
  Required<Pick<TValue, TKey>>;

export type TreeSpecies = {
  id: number;
  tree_species_name: string;
  latin_name: string;
  tree_species_name_slo: string;
};

interface ListOptions {
  filterBy?: string;
  sortBy?: "name" | "id" | "email";
  language?: "en" | "sl";
}

const ensureTreeSpecies = async (opts: ListOptions) => {
  const db = await getDatabase();
  const params = compact([opts.sortBy || "id"]);
  const sql = `
    SELECT 
      *, 
      ${opts.language === "sl" ? "tree_species_name_slo" : "tree_species_name"} as "tree_species_name" 
    FROM "tree_species" 
    ORDER BY $1
  `;
  const result = await db.select(sql, params);

  const treeSpecies = result as TreeSpecies[];
  return treeSpecies;
};

export async function postTreeSpecies(
  partialTreeSpecies: Partial<TreeSpecies>
): Promise<TreeSpecies> {
  if (partialTreeSpecies.tree_species_name?.includes("error")) {
    throw new Error("Ouch!");
  }

  const treeSpecies: Partial<TreeSpecies> = {
    tree_species_name:
      partialTreeSpecies.tree_species_name ??
      `New TreeSpecies ${String(Date.now()).slice(0, 5)}`,
  };

  const db = await getDatabaseForModify();
  const result = await db.execute(
    `INSERT INTO "tree_species" (
      "length", 
      "width", 
      "plate_no", 
      "seller_id"
    ) values (
      $1, 
      $2, 
      $3, 
      $4, 
      $5
    )`,
    [0, 0, 0, 0, partialTreeSpecies.tree_species_name]
  );

  return {
    ...treeSpecies,
    id: result.lastInsertId,
  } as TreeSpecies;
}

export async function removeTreeSpecies(
  partialTreeSpecies: Partial<TreeSpecies>
): Promise<TreeSpecies> {
  const db = await getDatabaseForModify();
  await db.execute(`DELETE FROM "tree_species" WHERE "id" = $1`, [
    partialTreeSpecies.id,
  ]);

  return partialTreeSpecies as TreeSpecies;
}

export async function patchTreeSpecies(
  treeSpecies: PickAsRequired<Partial<TreeSpecies>, "id">
) {
  const db = await getDatabaseForModify();
  await db.execute(
    `UPDATE "tree_species" 
      SET 
        "width" = COALESCE($2, "width"), 
        "length"=COALESCE($3, "length"), 
        "plate_no"=COALESCE($5, "plate_no")  
        WHERE id=$1`,
    [treeSpecies.id, treeSpecies.tree_species_name, treeSpecies.latin_name]
  );
}

export const useCreateTreeSpeciesMutation = (
  onSuccess?: (treeSpecies: TreeSpecies) => void
) => {
  return useMutation({
    mutationFn: postTreeSpecies,
    onSuccess: (treeSpecies: TreeSpecies) => {
      queryClient.invalidateQueries({ queryKey: ["tree_species"] });
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
      queryClient.invalidateQueries({ queryKey: ["tree_species"] });
      if (onSuccess) onSuccess(treeSpecies);
    },
  });
};

export const useUpdateTreeSpeciesMutation = (onSuccess?: () => void) => {
  return useMutation({
    mutationFn: patchTreeSpecies,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tree_species"] });
      if (onSuccess) onSuccess();
    },
    gcTime: 1000 * 10,
  });
};

export const treeSpeciesQueryOptions = (opts: ListOptions) =>
  queryOptions({
    queryKey: ["tree_species", opts],
    queryFn: () => ensureTreeSpecies(opts),
    staleTime: Infinity,
  });
