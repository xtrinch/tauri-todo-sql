import { queryOptions, useMutation } from "@tanstack/react-query";
import { queryClient } from "../main";
import { getDatabase, getDatabaseForModify } from "./database";
type PickAsRequired<TValue, TKey extends keyof TValue> = Omit<TValue, TKey> &
  Required<Pick<TValue, TKey>>;

export type Seller = {
  id: number;
  seller_name: string;
  address_line1: string;
  address_line2: string;
};

const ensureSellers = async (opts: {
  filterBy?: string;
  sortBy?: "seller_name" | "id" | "email";
  sortDirection?: "DESC" | "ASC";
}) => {
  const db = await getDatabase();
  const result = await db.select(
    `SELECT * from "sellers" ${opts.filterBy ? `WHERE "seller_name" LIKE lower($1)` : ""} 
    ORDER BY ${opts.sortBy || "seller_name"} ${opts.sortDirection || "DESC"}`,
    [opts.filterBy ? `%${opts.filterBy}%` : undefined]
  );

  const sellers = result as Seller[];
  return sellers;
};

export async function fetchSellerById(id: number) {
  const db = await getDatabase();
  const result = await db.select(`SELECT * from "sellers" where id = $1`, [id]);
  const seller = (result as Seller[])[0];
  return seller;
}

export async function postSeller(
  partialSeller: Partial<Seller>
): Promise<Seller> {
  if (partialSeller.seller_name?.includes("error")) {
    throw new Error("Ouch!");
  }

  const seller: Partial<Seller> = {
    seller_name: partialSeller.seller_name,
  };

  const db = await getDatabaseForModify();
  const result = await db.execute(
    `INSERT INTO "sellers" ("seller_name", "address_line1", "address_line2") values ($1, $2, $3)`,
    [
      seller.seller_name || "",
      seller.address_line1 || "",
      seller.address_line2 || "",
    ]
  );

  return {
    ...seller,
    id: result.lastInsertId,
  } as Seller;
}

export async function patchSeller({
  id,
  ...updatedSeller
}: PickAsRequired<Partial<Seller>, "id">) {
  const db = await getDatabaseForModify();
  await db.execute(
    `UPDATE "sellers" 
      SET 
        "seller_name" = COALESCE($2, "seller_name"), 
        "address_line1" = COALESCE($3, "address_line1"), 
        "address_line2" = COALESCE($4, "address_line2") 
      WHERE id = $1`,
    [
      id,
      updatedSeller.seller_name,
      updatedSeller.address_line1,
      updatedSeller.address_line2,
    ]
  );
}

export const sellerQueryOptions = (sellerId: number) =>
  queryOptions({
    queryKey: ["sellers", sellerId],
    queryFn: () => fetchSellerById(sellerId),
    staleTime: Infinity,
  });

export const useCreateSellerMutation = (
  onSuccess?: (seller: Seller) => void
) => {
  return useMutation({
    mutationFn: postSeller,
    onSuccess: (seller: Seller) => {
      queryClient.invalidateQueries({ queryKey: ["sellers"] });
      if (onSuccess) onSuccess(seller);
    },
  });
};

export const useUpdateSellerMutation = (
  sellerId: number,
  onSuccess?: () => void
) => {
  return useMutation({
    mutationKey: ["sellers", "update", sellerId],
    mutationFn: patchSeller,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sellers"] });
      if (onSuccess) onSuccess();
    },
    gcTime: 1000 * 10,
  });
};

export const sellersQueryOptions = (opts: {
  filterBy?: string;
  sortBy?: "seller_name" | "id" | "email";
  sortDirection?: "DESC" | "ASC";
}) =>
  queryOptions({
    queryKey: ["sellers", opts],
    queryFn: () => ensureSellers(opts),
    staleTime: Infinity,
  });

export async function removeSeller(
  partialWoodPiece: Partial<Seller>
): Promise<Seller> {
  const db = await getDatabaseForModify();
  await db.execute(`DELETE FROM "sellers" WHERE "id" = $1`, [
    partialWoodPiece.id,
  ]);

  return partialWoodPiece as Seller;
}

export const useRemoveSellerMutation = (
  onSuccess?: (seller: Seller) => void
) => {
  return useMutation({
    mutationFn: removeSeller,
    onSuccess: (seller: Seller) => {
      queryClient.invalidateQueries({ queryKey: ["sellers"] });
      if (onSuccess) onSuccess(seller);
    },
  });
};
