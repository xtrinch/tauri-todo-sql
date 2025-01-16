import { queryOptions, useMutation } from "@tanstack/react-query";
import { info } from "@tauri-apps/plugin-log";
import { queryClient } from "../main";
import { getDatabase, getDatabaseForModify } from "./database";
type PickAsRequired<TValue, TKey extends keyof TValue> = Omit<TValue, TKey> &
  Required<Pick<TValue, TKey>>;

export type Seller = {
  id: number;
  seller_name: string;
  address_line1: string;
  address_line2: string;
  iban: string;
  ident: string;
  is_flat_rate: number; // whether to tax at a flat rate
  is_vat_liable: number; // whether seller is VAT liable
  used_transport: number; // whether seller used transport or not
  used_logging: number; // woods logging
  used_logging_non_woods: number; // logging outside woods
  transport_costs: number;
  logging_costs: number;
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
    `INSERT INTO "sellers" (
      "seller_name", 
      "address_line1", 
      "address_line2",
      "iban",
      "ident",
      "is_flat_rate",
      "is_vat_liable",
      "used_transport",
      "used_logging",
      "transport_costs",
      "used_logging_non_woods",
      "logging_costs"
    ) values (
      $1, 
      $2, 
      $3,
      $4,
      $5,
      $6, 
      $7,
      $8,
      $9,
      $10,
      $11,
      $12
    )`,
    [
      seller.seller_name || "",
      seller.address_line1 || "",
      seller.address_line2 || "",
      seller.iban || "",
      seller.ident || "",
      seller.is_flat_rate || 0,
      seller.is_vat_liable || 0,
      seller.used_transport || 0,
      seller.used_logging || 0,
      seller.transport_costs || 0,
      seller.used_logging_non_woods || 0,
      seller.logging_costs || 0,
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
        "address_line2" = COALESCE($4, "address_line2"),
        "iban" = COALESCE($5, "iban"),
        "ident" = COALESCE($6, "ident"),
        "is_flat_rate" = COALESCE($7, "is_flat_rate"),
        "is_vat_liable" = COALESCE($8, "is_vat_liable"),
        "used_transport" = COALESCE($9, "used_transport"),
        "used_logging" = COALESCE($10, "used_logging"),
        "transport_costs" = COALESCE($11, "transport_costs"),
        "used_logging_non_woods" = COALESCE($12, "used_logging_non_woods"),
        "logging_costs" = COALESCE($13, "logging_costs")
      WHERE id = $1`,
    [
      id,
      updatedSeller.seller_name,
      updatedSeller.address_line1,
      updatedSeller.address_line2,
      updatedSeller.iban,
      updatedSeller.ident,
      updatedSeller.is_flat_rate,
      updatedSeller.is_vat_liable,
      updatedSeller.used_transport,
      updatedSeller.used_logging,
      updatedSeller.transport_costs,
      updatedSeller.used_logging_non_woods,
      updatedSeller.logging_costs,
    ]
  );
}

export const sellerQueryOptions = (sellerId: number) =>
  queryOptions({
    queryKey: ["sellers", sellerId],
    queryFn: () => fetchSellerById(sellerId),
    staleTime: Infinity,
  });

export const useCreateSellerMutation = (opts?: {
  onSuccess?: (seller: Seller) => void;
  onError?: (error: Error) => void;
}) => {
  return useMutation({
    mutationFn: postSeller,
    onSuccess: (seller: Seller) => {
      queryClient.invalidateQueries({ queryKey: ["sellers"] });
      if (opts?.onSuccess) opts.onSuccess(seller);
    },
    onError: (e) => {
      info(JSON.stringify(e));
      if (opts?.onError) opts.onError(e);
    },
  });
};

export const useUpdateSellerMutation = (
  sellerId: number,
  opts?: {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
  }
) => {
  return useMutation({
    mutationKey: ["sellers", "update", sellerId],
    mutationFn: patchSeller,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sellers"] });
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

export const useRemoveSellerMutation = (opts?: {
  onSuccess?: (seller: Seller) => void;
  onError?: (error: Error) => void;
}) => {
  return useMutation({
    mutationFn: removeSeller,
    onSuccess: (seller: Seller) => {
      queryClient.invalidateQueries({ queryKey: ["sellers"] });
      if (opts?.onSuccess) opts.onSuccess(seller);
    },
    onError: (e) => {
      info(JSON.stringify(e));
      if (opts?.onError) opts.onError(e);
    },
  });
};
