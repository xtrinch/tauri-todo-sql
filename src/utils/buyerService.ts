import { queryOptions, useMutation } from "@tanstack/react-query";
import { queryClient } from "../main";
import { getDatabase } from "./database";

type PickAsRequired<TValue, TKey extends keyof TValue> = Omit<TValue, TKey> &
  Required<Pick<TValue, TKey>>;

export type Buyer = {
  id: number;
  name: string;
};

const ensureBuyers = async (opts: {
  filterBy?: string;
  sortBy?: "name" | "id" | "email";
}) => {
  const db = await getDatabase();
  const result = await db.select(`SELECT * from "buyers" order by $1`, [
    opts.sortBy || "name",
  ]);

  const buyers = result as Buyer[];
  return buyers;
};

export async function fetchBuyerById(id: number) {
  const db = await getDatabase();
  const result = await db.select(`SELECT * from "buyers" where id = $1`, [id]);
  const buyer = (result as Buyer[])[0];
  return buyer;
}

export async function postBuyer(partialBuyer: Partial<Buyer>): Promise<Buyer> {
  if (partialBuyer.name?.includes("error")) {
    throw new Error("Ouch!");
  }

  const buyer = {
    name: partialBuyer.name ?? `New Buyer ${String(Date.now()).slice(0, 5)}`,
  };

  const db = await getDatabase();
  const result = await db.execute(`INSERT INTO "buyers" ("name") values ($1)`, [
    buyer.name,
  ]);

  return { ...buyer, id: result.lastInsertId } as Buyer;
}

export async function patchBuyer({
  id,
  ...updatedBuyer
}: PickAsRequired<Partial<Buyer>, "id">) {
  const db = await getDatabase();
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

export const useCreateBuyerMutation = (onSuccess?: (buyer: Buyer) => void) => {
  return useMutation({
    mutationFn: postBuyer,
    onSuccess: (buyer: Buyer) => {
      queryClient.invalidateQueries();
      if (onSuccess) onSuccess(buyer);
    },
  });
};

export const useUpdateBuyerMutation = (
  buyerId: number,
  onSuccess?: () => void
) => {
  return useMutation({
    mutationKey: ["buyers", "update", buyerId],
    mutationFn: patchBuyer,
    onSuccess: () => {
      queryClient.invalidateQueries();
      if (onSuccess) onSuccess();
    },
    gcTime: 1000 * 10,
  });
};

export const buyersQueryOptions = (opts: {
  filterBy?: string;
  sortBy?: "name" | "id" | "email";
}) =>
  queryOptions({
    queryKey: ["buyers", opts],
    queryFn: () => ensureBuyers(opts),
  });
