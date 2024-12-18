import { queryOptions, useMutation } from "@tanstack/react-query";
import { info } from "@tauri-apps/plugin-log";
import { queryClient } from "../main";
import { getDatabase } from "./database";

type PickAsRequired<TValue, TKey extends keyof TValue> = Omit<TValue, TKey> &
  Required<Pick<TValue, TKey>>;

export type Seller = {
  id: number;
  name: string;
};

const ensureSellers = async (opts: {
  filterBy?: string;
  sortBy?: "name" | "id" | "email";
}) => {
  info("Info");

  const db = await getDatabase();
  const result = await db.select(`SELECT * from "sellers" order by $1`, [
    opts.sortBy || "name",
  ]);

  const sellers = result as Seller[];
  return sellers;
};

export async function fetchSellerById(id: number) {
  const db = await getDatabase();
  const result = await db.select(`SELECT * from "sellers" where id = $1`, [id]);
  const seller = (result as Seller[])[0];
  return seller;
}

export async function postSeller(partialSeller: Partial<Seller>) {
  if (partialSeller.name?.includes("error")) {
    throw new Error("Ouch!");
  }

  const seller = {
    name: partialSeller.name ?? `New Seller ${String(Date.now()).slice(0, 5)}`,
  };

  const db = await getDatabase();
  await db.execute(`INSERT INTO "sellers" ("name") values ($1)`, [seller.name]);

  return seller;
}

export async function patchSeller({
  id,
  ...updatedSeller
}: PickAsRequired<Partial<Seller>, "id">) {
  const db = await getDatabase();
  await db.execute(`UPDATE "sellers" SET "name" = $2 WHERE id=$1`, [
    id,
    updatedSeller.name,
  ]);
}

export const sellerQueryOptions = (sellerId: number) =>
  queryOptions({
    queryKey: ["sellers", sellerId],
    queryFn: () => fetchSellerById(sellerId),
  });

export const useCreateSellerMutation = (onSuccess?: () => void) => {
  return useMutation({
    mutationFn: postSeller,
    onSuccess: () => {
      queryClient.invalidateQueries();
      if (onSuccess) onSuccess();
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
      queryClient.invalidateQueries();
      if (onSuccess) onSuccess();
    },
    gcTime: 1000 * 10,
  });
};

export const sellersQueryOptions = (opts: {
  filterBy?: string;
  sortBy?: "name" | "id" | "email";
}) =>
  queryOptions({
    queryKey: ["sellers", opts],
    queryFn: () => ensureSellers(opts),
  });
