import { queryOptions, useMutation } from "@tanstack/react-query";
import Database from "@tauri-apps/plugin-sql";
import { queryClient } from "../main";

type PickAsRequired<TValue, TKey extends keyof TValue> = Omit<TValue, TKey> &
  Required<Pick<TValue, TKey>>;

export type Buyer = {
  id: number;
  name: string;
};

let buyers: Array<Buyer> = null!;

const ensureBuyers = async () => {
  const db = await Database.load("sqlite:licitacija.db");
  const result = await db.select(`SELECT * from "buyers"`);
  buyers = result as Buyer[];
  return buyers;
};

export async function fetchBuyerById(id: number) {
  const db = await Database.load("sqlite:licitacija.db");
  const result = await db.select(`SELECT * from "buyers" where id = $1`, [id]);
  const buyer = (result as Buyer[])[0];
  return buyer;
}

export async function postBuyer(partialBuyer: Partial<Buyer>) {
  if (partialBuyer.name?.includes("error")) {
    throw new Error("Ouch!");
  }

  const invoice = {
    name: partialBuyer.name ?? `New Buyer ${String(Date.now()).slice(0, 5)}`,
  };

  const db = await Database.load("sqlite:licitacija.db");
  await db.execute(`INSERT INTO "buyers" ("name") values ($1)`, [invoice.name]);

  return invoice;
}

export async function patchBuyer({
  id,
  ...updatedBuyer
}: PickAsRequired<Partial<Buyer>, "id">) {
  const db = await Database.load("sqlite:licitacija.db");
  await db.execute(`UPDATE "buyers" SET "name" = $2 WHERE id=$1`, [
    id,
    updatedBuyer.name,
  ]);
}

export const buyerQueryOptions = (buyerId: number) =>
  queryOptions({
    queryKey: ["buyers", buyerId],
    queryFn: () => fetchBuyerById(buyerId),
  });

export const useCreateBuyerMutation = () => {
  return useMutation({
    mutationFn: postBuyer,
    onSuccess: () => queryClient.invalidateQueries(),
  });
};

export const useUpdateBuyerMutation = (buyerId: number) => {
  return useMutation({
    mutationKey: ["invoices", "update", buyerId],
    mutationFn: patchBuyer,
    onSuccess: () => queryClient.invalidateQueries(),
    gcTime: 1000 * 10,
  });
};

export const buyersQueryOptions = () =>
  queryOptions({
    queryKey: ["buyers"],
    queryFn: () => ensureBuyers(),
  });
