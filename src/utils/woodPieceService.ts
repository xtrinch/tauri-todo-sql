import { queryOptions, useMutation } from "@tanstack/react-query";
import { info } from "@tauri-apps/plugin-log";
import { compact, groupBy, keyBy, maxBy, range } from "lodash";
import { queryClient } from "../main";
import { getDatabase, getDatabaseForModify } from "./database";

type PickAsRequired<TValue, TKey extends keyof TValue> = Omit<TValue, TKey> &
  Required<Pick<TValue, TKey>>;

export interface WoodPiece {
  id: number;
  wood_piece_name: string;
  seller_id: number;
  tree_species_id: number;
  length: number;
  width: number;
  volume: number;
  plate_no: number;
  sequence_no: number;
  min_price?: number;
  bypass_min_price?: boolean; // whether we can bypass min price for final sale

  // from other tables
  offered_total_price?: number;
  seller_name: string;
  tree_species_name: string;
  offered_price?: number;
  buyer_name?: string;
  ident: string;
  duplicate_plate_no?: boolean;
  duplicate_seq_no?: boolean;
}

interface ListOptions {
  tree_species_id?: number;
  seller_id?: number;
  buyer_id?: number;
  offered_price__isnull?: boolean;
  offered_price__isnotnull?: boolean;
  offered_price__islowerthanmin?: boolean;
  groupBy_tree_species?: boolean;
  filterBy?: string;
  sortBy?: "id" | "sequence_no";
  relations?: string[];
  sortDirection?: "DESC" | "ASC";
  language?: "en" | "sl";
  min_price_used?: boolean;
  enabled?: boolean;
  offered_price__isnotzero?: boolean;
  id__not_in?: number[];
  mark_duplicates?: boolean;
  fill_empty_seq_lines?: boolean;
}

export const ensureWoodPieces = async (opts: ListOptions) => {
  const db = await getDatabase();
  const params = [opts.seller_id, opts.tree_species_id, opts.buyer_id];

  const where = compact([
    opts.seller_id ? `"seller_id" = $1 ` : "",
    opts.tree_species_id ? `"tree_species_id" = $2` : "",
    opts.offered_price__isnull ? `"offered_price" IS NULL` : "",
    opts.offered_price__isnotnull ? `"offered_price" IS NOT NULL` : "",
    opts.offered_price__isnotzero ? `"offered_price" > 0` : "",
    opts.offered_price__islowerthanmin ? `"offered_price" < "min_price"` : "",
    opts.min_price_used
      ? `("min_price" <= "offered_price" OR "min_price" IS NULL OR "bypass_min_price" = 1)`
      : "",
    opts.id__not_in
      ? `"wood_pieces"."id" NOT IN (${opts.id__not_in.map((id) => `${id}`).join(", ")})`
      : "",
  ]);

  let sql = `
    SELECT 
      *, 
      "wood_pieces"."id" as "id",
      "tree_species"."id" as "tree_species_id",
      round("offered_price" * "volume", 2) as "offered_total_price",
      MAX("wood_piece_offers"."offered_price") as "offered_price",
      ${opts.language === "sl" ? "tree_species_name_slo" : "tree_species_name"} as "tree_species_name"
    FROM "wood_pieces"
    LEFT JOIN "tree_species" ON "wood_pieces"."tree_species_id" = "tree_species"."id"
    LEFT JOIN "sellers" ON "wood_pieces"."seller_id" = "sellers"."id"
    LEFT JOIN "wood_piece_offers" ON "wood_pieces"."id" = "wood_piece_offers"."wood_piece_id"
    LEFT JOIN "buyers" ON "wood_piece_offers"."buyer_id" = "buyers"."id"
    ${where.length > 0 ? `WHERE ${where.join(" AND ")}` : ``}
    GROUP BY "wood_pieces"."id"
    ORDER BY ${opts.sortBy || "sequence_no"} ${opts.sortDirection || "ASC"}`;

  if (opts.buyer_id) {
    sql = `
      SELECT 
        *,
        ${opts.language === "sl" ? "tree_species_name_slo" : "tree_species_name"} as "tree_species_name"
      FROM (${sql}) 
      WHERE "buyer_id" = $3
    `;
  }
  if (opts.groupBy_tree_species) {
    sql = `
      SELECT 
        *,
        SUM("volume") as "volume",
        SUM("offered_total_price") as "offered_total_price",
        ${opts.language === "sl" ? "tree_species_name_slo" : "tree_species_name"} as "tree_species_name"
      FROM (${sql}) 
      GROUP BY "tree_species_id"
    `;
  }
  let result: WoodPiece[] = [];
  try {
    result = (await db.select(sql, params)) as WoodPiece[];
  } catch (e) {
    info(JSON.stringify(e));
    throw e;
  }

  let woodPieces = result as WoodPiece[];
  if (opts.mark_duplicates) {
    const duplicate_plate_no_sql = `SELECT "plate_no", COUNT(*) c FROM "wood_pieces" GROUP BY "plate_no" HAVING c > 1;`;
    const duplicate_plate_nos = (await db.select(duplicate_plate_no_sql)) as {
      id: number;
    }[];
    const duplicate_plate_nos_map = keyBy(duplicate_plate_nos, "plate_no");

    const duplicate_seq_no_sql = `SELECT "sequence_no", COUNT(*) c FROM "wood_pieces" GROUP BY "sequence_no" HAVING c > 1;`;
    const duplicate_seq_nos = (await db.select(duplicate_seq_no_sql)) as {
      id: number;
    }[];
    const duplicate_seq_nos_map = keyBy(duplicate_seq_nos, "sequence_no");
    woodPieces = woodPieces.map((wp) => ({
      ...wp,
      duplicate_plate_no: !!duplicate_plate_nos_map[wp.plate_no],
      duplicate_seq_no: !!duplicate_seq_nos_map[wp.sequence_no],
    }));
  }

  if (opts.fill_empty_seq_lines && woodPieces.length > 0) {
    const nullSeqNoWps = woodPieces.filter((wp) => !wp.sequence_no);
    const max_seq_no = maxBy(woodPieces, "sequence_no")?.sequence_no;
    if (max_seq_no) {
      const woodPiecesMap = groupBy<WoodPiece>(woodPieces, "sequence_no");
      woodPieces = [];
      for (let i of range(1, max_seq_no + 1)) {
        if (woodPiecesMap[i]) {
          woodPieces.push(
            ...woodPiecesMap[i].map((wp) => ({
              ...wp,
              sequence_no: wp.sequence_no || 0,
            }))
          );
        } else {
          woodPieces.push({} as WoodPiece);
        }
      }
      woodPieces.push(...nullSeqNoWps);
    }
  }
  return woodPieces;
};

const ensureWoodPiecesCount = async () => {
  const db = await getDatabase();

  let sql = `
    SELECT 
      COUNT(*) as "count"
    FROM "wood_pieces"`;

  let result: { count: number }[];
  try {
    result = (await db.select(sql)) as any;
  } catch (e) {
    info(JSON.stringify(e));
    throw e;
  }
  return result[0].count;
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
  if (partialWoodPiece.wood_piece_name?.includes("error")) {
    throw new Error("Ouch!");
  }

  const woodPiece: Partial<WoodPiece> = {
    wood_piece_name:
      partialWoodPiece.wood_piece_name ??
      `New WoodPiece ${String(Date.now()).slice(0, 5)}`,
  };

  const db = await getDatabaseForModify();
  let result;
  result = await db.execute(
    `INSERT INTO "wood_pieces" (
      "length", 
      "width", 
      "plate_no", 
      "seller_id",
      "min_price",
      "bypass_min_price",
      "sequence_no"
    ) values (
      $1, 
      $2, 
      $3, 
      $4, 
      $5,
      $6,
      $7
    )`,
    ["", "", "", partialWoodPiece.seller_id, "", 0, ""]
  );
  return {
    ...woodPiece,
    id: result.lastInsertId,
  } as WoodPiece;
}

export async function removeWoodPiece(
  partialWoodPiece: Partial<WoodPiece>
): Promise<WoodPiece> {
  const db = await getDatabaseForModify();
  await db.execute(`DELETE FROM "wood_pieces" WHERE "id" = $1`, [
    partialWoodPiece.id,
  ]);

  return partialWoodPiece as WoodPiece;
}

export async function patchWoodPiece(
  woodPiece: PickAsRequired<Partial<WoodPiece>, "id">
) {
  const db = await getDatabaseForModify();
  await db.execute(
    `UPDATE "wood_pieces" 
    SET 
      "width" = COALESCE($2, "width"), 
      "length" = COALESCE($3, "length"), 
      "plate_no" = COALESCE($4, "plate_no"),
      "tree_species_id" = COALESCE($5, "tree_species_id"),
      "sequence_no" = COALESCE($6, "sequence_no"),
      "seller_id" = COALESCE($7, "seller_id"),
      "min_price" = COALESCE($8, "min_price"),
      "bypass_min_price" = COALESCE($9, "bypass_min_price")
    WHERE id=$1`,
    [
      woodPiece.id,
      woodPiece.width,
      woodPiece.length,
      woodPiece.plate_no,
      woodPiece.tree_species_id,
      woodPiece.sequence_no,
      woodPiece.seller_id,
      woodPiece.min_price,
      woodPiece.bypass_min_price,
    ]
  );
}

export const woodPieceQueryOptions = (woodPieceId: number) =>
  queryOptions({
    queryKey: ["wood_pieces", woodPieceId],
    queryFn: () => fetchWoodPieceById(woodPieceId),
    staleTime: Infinity,
  });

export const useCreateWoodPieceMutation = (opts?: {
  onSuccess?: (buyer: WoodPiece) => void;
  onError?: (error: Error) => void;
}) => {
  return useMutation({
    mutationFn: postWoodPiece,
    onSuccess: (woodPiece: WoodPiece) => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          ["wood_pieces", "statistics"].includes(query.queryKey[0] as string),
      });
      if (opts?.onSuccess) opts.onSuccess(woodPiece);
    },
    onError: (e) => {
      info(JSON.stringify(e));
    },
  });
};

export const useRemoveWoodPieceMutation = (opts?: {
  onSuccess?: (woodPiece: WoodPiece) => void;
  onError?: () => void;
}) => {
  return useMutation({
    mutationFn: removeWoodPiece,
    onSuccess: (woodPiece: WoodPiece) => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          ["wood_pieces", "statistics"].includes(query.queryKey[0] as string),
      });
      if (opts?.onSuccess) opts.onSuccess(woodPiece);
    },
    onError: (e) => {
      info(JSON.stringify(e));
      if (opts?.onError) opts.onError();
    },
  });
};

export const useUpdateWoodPieceMutation = (opts?: {
  onSuccess?: () => void;
  onError?: (e: Error) => void;
}) => {
  return useMutation({
    mutationFn: patchWoodPiece,
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          ["wood_pieces", "statistics"].includes(query.queryKey[0] as string),
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

export const woodPiecesQueryOptions = (opts: ListOptions) =>
  queryOptions({
    queryKey: ["wood_pieces", opts],
    queryFn: () => ensureWoodPieces(opts),
    staleTime: Infinity,
    enabled: opts.enabled,
  });

export const woodPiecesCountQueryOptions = () =>
  queryOptions({
    queryKey: ["wood_pieces", "count"],
    queryFn: () => ensureWoodPiecesCount(),
    staleTime: Infinity,
  });
