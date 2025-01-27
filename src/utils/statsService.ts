import { queryOptions } from "@tanstack/react-query";
import { info } from "@tauri-apps/plugin-log";
import { getDatabase } from "./database";

export interface Statistics {
  total_volume: number;
  num_wood_pieces: number;
  offered_max_price: number;
  total_income: number;
  costs_below_350: number;
  total_logging_costs: number;
  total_transport_costs: number;
  costs_above_350: number;
}

interface ListOptions {}

const ensureStats = async (): Promise<Statistics> => {
  const db = await getDatabase();

  // let sql = `
  //   SELECT
  //     COUNT(*) as "num_wood_pieces",
  //     SUM("volume") as "total_volume",
  //     MAX("offered_max_price") as "offered_max_price"
  //   FROM (
  //     SELECT
  //       *,
  //       MAX("wood_piece_offers"."offered_price") as "offered_max_price"
  //     FROM "wood_pieces"
  //     LEFT JOIN "wood_piece_offers" ON "wood_pieces"."id" = "wood_piece_offers"."wood_piece_id"
  //     GROUP BY "wood_pieces"."id"
  //   )`;

  // let totalResult: Statistics[] = [];
  // try {
  //   totalResult = (await db.select(sql, [])) as Statistics[];
  // } catch (e) {
  //   info(JSON.stringify(e));
  //   throw e;
  // }

  // let sellers = await ensureSellers({});

  // const woodPieces = await ensureWoodPieces({});

  // const groupedWoodPieces = groupBy(woodPieces, "seller_id");

  // let costsBelow350 = new Big(0);
  // let costsAbove350 = new Big(0);
  // let transportCosts = new Big(0);
  // let loggingCosts = new Big(0);

  // for (let seller of sellers) {
  //   const sellerWoodPieces = groupedWoodPieces[seller.id] || [];

  //   const totalVolume = sellerWoodPieces
  //     .reduce((sum: Big, row) => sum.plus(row.volume as number), new Big(0))
  //     .round(2);
  //   // sum transport costs
  //   const sellerTransportCosts = (
  //     seller.used_transport
  //       ? totalVolume.mul(seller.transport_costs || 0)
  //       : new Big(0)
  //   ).round(2);

  //   // sum logging costs
  //   const sellerLoggingCosts = (
  //     seller.used_logging || seller.used_logging_non_woods
  //       ? totalVolume.mul(seller.logging_costs || 0)
  //       : new Big(0)
  //   ).round(2);

  //   // sum auction costs
  //   const sellerCostsBelow350 = sellerWoodPieces
  //     .reduce(
  //       (sum, row) => sum.plus(new Big(22).mul(row.volume as number)),
  //       new Big(0)
  //     )
  //     .round(2);
  //   const sellerCostsAbove350 = sellerWoodPieces
  //     .reduce(
  //       (sum, row) =>
  //         sum.plus(new Big(0.05).mul((row.offered_total_price as number) || 0)),
  //       new Big(0)
  //     )
  //     .round(2);

  //   costsBelow350 = costsBelow350.add(sellerCostsBelow350);
  //   costsAbove350 = costsAbove350.add(sellerCostsAbove350);
  //   transportCosts = transportCosts.add(sellerTransportCosts);
  //   loggingCosts = loggingCosts.add(sellerLoggingCosts);
  // }

  // const licitatorIncome = costsBelow350
  //   .add(costsAbove350)
  //   .add(loggingCosts)
  //   .add(transportCosts);

  const priceSql = `
    SELECT 
      *,
      SUM(
          ROUND("total_transport_costs", 2) 
          + ROUND("total_logging_costs", 2) 
          + ROUND("costs_below_350", 2) 
          + ROUND("costs_above_350", 2)
        ) as "total_income"
    FROM (
      SELECT --- this one also does the grouping of all rows
        ROUND(SUM("total_transport_costs"), 2) as total_transport_costs,
        ROUND(SUM("total_logging_costs"), 2) as "total_logging_costs",
        ROUND(SUM("costs_below_350"), 2) as "costs_below_350",
        ROUND(SUM("costs_above_350_1"), 2) as "costs_above_350",
        ROUND(SUM("total_volume"), 2) as "total_volume",
        MAX("offered_price") as "offered_max_price",
        SUM("num_pieces") as "num_wood_pieces"
      FROM (
        SELECT --- just selects some additional stuff on top of one row per seller
          *,
          CASE WHEN "sellers"."used_transport" = 1
            THEN ROUND("sellers"."transport_costs" * "sellers"."total_volume", 2)
            ELSE 0
          END AS "total_transport_costs",
          CASE WHEN ("sellers"."used_logging" = 1 OR "sellers"."used_logging_non_woods" = 1)
            THEN ROUND("sellers"."logging_costs" * "sellers"."total_volume", 2)
            ELSE 0
          END AS "total_logging_costs",
          round("sellers"."total_volume" * 22, 2) as "costs_below_350",
          round("sellers"."total_price1" * 0.05, 2) as "costs_above_350_1"
        FROM (
          SELECT  -- this one selects one row per seller, so already summed values
            *,
            SUM("costs_above_350") as "costs_above_350",
            MAX("offered_price") as "offered_price",
            SUM("volume") AS "total_volume",
            SUM(case when "wp_id" is NOT null then 1 else 0 end) as "num_pieces",
            SUM("total_price") AS "total_price1"
          FROM (
            SELECT --- this one selects all wood pieces flattened
              *,
              COALESCE("offered_price", 0) * "volume" as "total_price",
              "wood_pieces"."id" as "wp_id"
            FROM "sellers"
            LEFT JOIN "wood_pieces" ON "wood_pieces"."seller_id" = "sellers"."id"
            LEFT JOIN ( --- left join with max offer
              SELECT 
                *, 
                row_number() OVER (PARTITION BY "wood_piece_id" ORDER BY "offered_price" DESC) as "seq_num" 
              FROM "wood_piece_offers" 
            ) "wpo" ON ("wood_pieces"."id" = "wpo"."wood_piece_id" AND "wpo"."seq_num" = 1)
          )
          GROUP BY "seller_id"
        ) as "sellers"
      )
    )
  `;
  let priceResult: Statistics[] = [];
  try {
    priceResult = (await db.select(priceSql, [])) as Statistics[];
  } catch (e) {
    info(JSON.stringify(e));
    throw e;
  }

  const statistics: Statistics = {
    num_wood_pieces: priceResult[0].num_wood_pieces,
    offered_max_price: priceResult[0].offered_max_price,
    total_volume: priceResult[0].total_volume,
    total_income: priceResult[0].total_income,
    costs_below_350: priceResult[0].costs_below_350,
    costs_above_350: priceResult[0].costs_above_350,
    total_logging_costs: priceResult[0].total_logging_costs,
    total_transport_costs: priceResult[0].total_transport_costs,

    // num_wood_pieces: totalResult[0].num_wood_pieces,
    // offered_max_price: totalResult[0].offered_max_price,
    // total_volume: totalResult[0].total_volume,
    // total_income: licitatorIncome.toNumber(),
    // costs_below_350: costsBelow350.toNumber(),
    // costs_above_350: costsAbove350.toNumber(),
    // total_logging_costs: loggingCosts.toNumber(),
    // total_transport_costs: transportCosts.toNumber(),
  };
  return statistics;
};

export const statsQueryOptions = (opts: ListOptions) =>
  queryOptions({
    queryKey: ["statistics", opts],
    queryFn: () => ensureStats(),
    staleTime: Infinity,
  });
