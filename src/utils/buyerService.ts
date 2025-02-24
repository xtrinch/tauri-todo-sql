import { queryOptions, useMutation } from "@tanstack/react-query";
import { info } from "@tauri-apps/plugin-log";
import { queryClient } from "../main";
import { getDatabase, getDatabaseForModify } from "./database";

type PickAsRequired<TValue, TKey extends keyof TValue> = Omit<TValue, TKey> &
  Required<Pick<TValue, TKey>>;

export type Buyer = {
  id: number;
  buyer_name: string;
  address_line1: string;
  address_line2: string;
  is_vat_liable: number;
  used_bundle: number;
  used_loading: number;
  loading_costs: number;
  ident: string;
};

const ensureBuyers = async (opts: {
  filterBy?: string;
  sortBy?: "buyer_name" | "id" | "email";
  sortDirection?: "DESC" | "ASC";
}) => {
  const db = await getDatabase();
  const result = await db.select(
    `SELECT * from "buyers" ${opts.filterBy ? `WHERE ("buyer_name" LIKE lower($1) OR lower("ident") LIKE lower($1))` : ""} 
    ORDER BY ${opts.sortBy || "buyer_name"} ${opts.sortDirection || "DESC"}`,
    [opts.filterBy ? `%${opts.filterBy.replace(/š|č|ž/g, "")}%` : undefined]
  );

  const sellers = result as Buyer[];
  return sellers;
};

export async function fetchBuyerById(id: number) {
  const db = await getDatabase();
  const result = await db.select(`SELECT * from "buyers" where id = $1`, [id]);
  const buyer = (result as Buyer[])[0];
  return buyer;
}

export async function postBuyer(partialBuyer: Partial<Buyer>): Promise<Buyer> {
  if (partialBuyer.buyer_name?.includes("error")) {
    throw new Error("Ouch!");
  }

  const buyer = {
    buyer_name: partialBuyer.buyer_name,
  };

  const db = await getDatabaseForModify();
  const result = await db.execute(
    `INSERT INTO "buyers" ("buyer_name") values ($1)`,
    [buyer.buyer_name]
  );

  return { ...buyer, id: result.lastInsertId } as Buyer;
}

export async function patchBuyer({
  id,
  ...updatedBuyer
}: PickAsRequired<Partial<Buyer>, "id">) {
  const db = await getDatabaseForModify();
  await db.execute(
    `UPDATE "buyers" 
      SET 
        "buyer_name" = COALESCE($2, "buyer_name"), 
        "address_line1" = COALESCE($3, "address_line1"), 
        "address_line2" = COALESCE($4, "address_line2"),
        "is_vat_liable" = COALESCE($5, "is_vat_liable"),
        "loading_costs" = COALESCE($6, "loading_costs"),
        "used_bundle" = COALESCE($7, "used_bundle"),
        "used_loading" = COALESCE($8, "used_loading"),
        "ident" = COALESCE($9, "ident")
    WHERE id=$1`,
    [
      id,
      updatedBuyer.buyer_name,
      updatedBuyer.address_line1,
      updatedBuyer.address_line2,
      updatedBuyer.is_vat_liable,
      updatedBuyer.loading_costs,
      updatedBuyer.used_bundle,
      updatedBuyer.used_loading,
      updatedBuyer.ident,
    ]
  );
}

export const buyerQueryOptions = (buyerId: number) =>
  queryOptions({
    queryKey: ["buyers", buyerId],
    queryFn: () => fetchBuyerById(buyerId),
    staleTime: Infinity,
  });

export const useCreateBuyerMutation = (opts?: {
  onSuccess?: (buyer: Buyer) => void;
  onError?: (error: Error) => void;
}) => {
  return useMutation({
    mutationFn: postBuyer,
    onSuccess: (buyer: Buyer) => {
      queryClient.invalidateQueries({ queryKey: ["buyers"] });
      if (opts?.onSuccess) opts.onSuccess(buyer);
    },
    onError: (e) => {
      info(JSON.stringify(e));
      if (opts?.onError) opts.onError(e);
    },
  });
};

export const useUpdateBuyerMutation = (
  buyerId: number,
  opts?: {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
  }
) => {
  return useMutation({
    mutationKey: ["buyers", "update", buyerId],
    mutationFn: patchBuyer,
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          ["buyers", "statistics", "wood_pieces"].includes(
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

export const buyersQueryOptions = (opts: {
  filterBy?: string;
  sortBy?: "buyer_name" | "id" | "email";
  sortDirection?: "DESC" | "ASC";
}) =>
  queryOptions({
    queryKey: ["buyers", opts],
    queryFn: () => ensureBuyers(opts),
    staleTime: Infinity,
  });

export async function removeBuyer(
  partialBuyer: Partial<Buyer>
): Promise<Buyer> {
  const db = await getDatabaseForModify();
  await db.execute(`DELETE FROM "buyers" WHERE "id" = $1`, [partialBuyer.id]);

  return partialBuyer as Buyer;
}

export const useRemoveBuyerMutation = (opts?: {
  onSuccess?: (buyer: Buyer) => void;
  onError?: (error: Error) => void;
}) => {
  return useMutation({
    mutationFn: removeBuyer,
    onSuccess: (buyer: Buyer) => {
      queryClient.invalidateQueries({ queryKey: ["buyers"] });
      if (opts?.onSuccess) opts.onSuccess(buyer);
    },
    onError: (e) => {
      info(JSON.stringify(e));
      if (opts?.onError) {
        opts.onError(e);
      }
    },
  });
};
