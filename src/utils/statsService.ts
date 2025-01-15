import { queryOptions } from "@tanstack/react-query";
import { info } from "@tauri-apps/plugin-log";
import { getDatabase } from "./database";

export interface Statistics {
  total_volume: number;
  num_wood_pieces: number;
  offered_max_price: number;
}

interface ListOptions {}

const ensureStats = async (): Promise<Statistics> => {
  const db = await getDatabase();

  let sql = `
    SELECT 
      COUNT(*) as "num_wood_pieces", 
      SUM("volume") as "total_volume",
      MAX("offered_max_price") as "offered_max_price"
    FROM (
      SELECT 
        *,
        MAX("wood_piece_offers"."offered_price") as "offered_max_price"
      FROM "wood_pieces"
      LEFT JOIN "wood_piece_offers" ON "wood_pieces"."id" = "wood_piece_offers"."wood_piece_id"
      GROUP BY "wood_pieces"."id"
    )`;

  let result: Statistics[] = [];
  try {
    result = (await db.select(sql, [])) as Statistics[];
  } catch (e) {
    info(JSON.stringify(e));
    throw e;
  }
  const statistics = result[0];
  return statistics;
};

export const statsQueryOptions = (opts: ListOptions) =>
  queryOptions({
    queryKey: ["wood_pieces", opts],
    queryFn: () => ensureStats(opts),
  });
