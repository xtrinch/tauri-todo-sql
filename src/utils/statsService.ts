import { queryOptions } from "@tanstack/react-query";
import { info } from "@tauri-apps/plugin-log";
import { groupBy, keyBy } from "lodash";
import { getDatabase } from "./database";
import { Settings } from "./settingsService";
import { ensureTreeSpecies, TreeSpecies } from "./treeSpeciesService";
import { WoodPiece } from "./woodPieceService";

interface WoodPieceStats {
  top_logs_per_volume?: WoodPiece[];
  top_logs_total?: WoodPiece[];
  volume?: number;
  avg_offered_price?: number;
}
type TreeSpeciesWithStats = TreeSpecies & WoodPieceStats;

export interface Statistics {
  total_volume: number;
  num_wood_pieces: number;
  num_unsold_wood_pieces: number;
  offered_max_price: number;
  total_income: number;
  costs_below_350: number;
  total_logging_costs: number;
  total_transport_costs: number;
  total_bundle_costs: number; // from buyers
  total_loading_costs: number; // from buyers
  costs_above_350: number;
  sellers_net: number;
  buyers_net: number;
  top_logs_by_species: TreeSpeciesWithStats[];
  stats_by_species: { [key: string]: TreeSpeciesWithStats };
  top_logs: WoodPieceStats;
  seller_costs: number;
  buyer_costs: number;
}

interface ListOptions {
  language?: "en" | "sl";
}

const ensureStats = async (opts: ListOptions): Promise<Statistics> => {
  const db = await getDatabase();

  const woodPiecesSql = `
    SELECT --- this one selects all wood pieces flattened
      *,
      ROUND(COALESCE("offered_price", 0) * "volume", 2) as "total_price",
      "wood_pieces"."id" as "wp_id",
      "wood_piece_offers"."id" as "wpo_id"
    FROM "wood_pieces"
    LEFT JOIN "sellers" ON "wood_pieces"."seller_id" = "sellers"."id"
    LEFT JOIN ( --- left join with max offer
      SELECT 
        *, 
        row_number() OVER (PARTITION BY "wood_piece_id" ORDER BY "offered_price" DESC) as "seq_num" 
      FROM "wood_piece_offers" 
    ) "wood_piece_offers" ON (
      "wood_pieces"."id" = "wood_piece_offers"."wood_piece_id" 
      AND "wood_piece_offers"."seq_num" = 1
      AND ("wood_piece_offers"."offered_price" >= "wood_pieces"."min_price" OR "wood_pieces"."bypass_min_price" = 1)
    )
    LEFT JOIN "buyers" ON "wood_piece_offers"."buyer_id" = "buyers"."id"
  `;

  const sqlStats = `
    SELECT 
      *
    FROM "settings" 
  `;
  const result = await db.select(sqlStats, []);

  const settingsArray = result as Settings[];
  let settings = settingsArray[0];

  const sellersSql = `
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
      ROUND("sellers"."total_volume" * ${settings.licitator_fixed_cost}, 2) AS "costs_below_350",
      ROUND("costs_above_350_per_seller" * ${settings.licitator_percentage}, 2) AS "costs_above_350"
    FROM (
      SELECT  -- this one selects one row per seller, so already summed values
        *,
        MAX("offered_price") AS "offered_price",
        SUM("volume") AS "total_volume",
        SUM(CASE WHEN "wp_id" IS NOT NULL then 1 else 0 end) as "num_pieces",
        SUM(CASE WHEN "wpo_id" IS NULL AND "wp_id" IS NOT NULL then 1 else 0 end) as "num_unsold_pieces",
        SUM("total_price") AS "total_price1",
        SUM(CASE WHEN "offered_price" > 350 THEN ("total_price" - (350 * "volume")) ELSE 0 END) as "costs_above_350_per_seller"
      FROM (
        ${woodPiecesSql}
      )
      GROUP BY "seller_id"
    ) AS "sellers"
  `;

  const buyersSql = `
    SELECT --- just selects some additional stuff on top of one row per buyer
      *,
      CASE WHEN "buyers"."used_loading" = 1
        THEN ROUND("buyers"."total_volume" * "buyers"."loading_costs", 2)
        ELSE 0
      END AS "total_loading_costs",
      CASE WHEN ("buyers"."used_bundle" = 1)
        THEN ROUND("buyers"."total_volume" * ${settings.bundle_cost}, 2)
        ELSE 0
      END AS "total_bundle_costs"
    FROM (
      SELECT  -- this one selects one row per buyer, so already summed values
        *,
        SUM("volume") AS "total_volume",
        SUM("total_price") AS "total_price1"
      FROM (
        ${woodPiecesSql}
      )
      GROUP BY "buyer_id"
    ) AS "buyers"
  `;

  const priceSql = `
    SELECT --- sum up the total income
      *,
      SUM(
          ROUND("total_transport_costs", 2) 
          + ROUND("total_logging_costs", 2) 
          + ROUND("costs_below_350", 2) 
          + ROUND("costs_above_350", 2)
          + ROUND("total_loading_costs", 2)
          + ROUND("total_bundle_costs", 2)
        ) AS "total_income",
      SUM(
          ROUND("total_transport_costs", 2) 
          + ROUND("total_logging_costs", 2) 
          + ROUND("costs_below_350", 2) 
          + ROUND("costs_above_350", 2)
        ) AS "seller_costs",
      SUM(
          + ROUND("total_loading_costs", 2)
          + ROUND("total_bundle_costs", 2)
        ) AS "buyer_costs"
    FROM (
      SELECT --- this one also does the grouping of all rows
        ROUND(SUM("total_transport_costs"), 2) AS total_transport_costs,
        ROUND(SUM("total_logging_costs"), 2) AS "total_logging_costs",
        ROUND(SUM("costs_below_350"), 2) AS "costs_below_350",
        ROUND(SUM("costs_above_350"), 2) AS "costs_above_350",
        ROUND(SUM("total_volume"), 2) AS "total_volume",
        MAX("offered_price") AS "offered_max_price",
        SUM("num_pieces") AS "num_wood_pieces",
        SUM("num_unsold_pieces") AS "num_unsold_wood_pieces",
        ROUND(SUM("total_loading_costs"), 2) AS "total_loading_costs",
        ROUND(SUM("total_bundle_costs"), 2) AS "total_bundle_costs",
        ROUND(SUM("total_bundle_costs"), 2) AS "total_bundle_costs",
        ROUND(SUM("buyer_net"), 2) AS "buyers_net",
        ROUND(SUM("seller_net"), 2) AS "sellers_net"
      FROM ( --- some data from sellers, some data from buyers
        SELECT 
          "total_transport_costs", 
          "total_logging_costs",
          "costs_below_350",
          "costs_above_350",
          "total_volume",
          "offered_price",
          "num_pieces",
          "num_unsold_pieces",
          NULL AS "total_loading_costs",
          NULL AS "total_bundle_costs",
          "total_price1" AS "seller_net",
          0 AS "buyer_net"
        FROM (${sellersSql})
        UNION ALL 
        SELECT 
          NULL AS "total_transport_costs", 
          NULL AS "total_logging_costs",
          NULL AS "costs_below_350",
          NULL AS "costs_above_350",
          NULL AS "total_volume",
          "offered_price",
          NULL AS "num_pieces",
          NULL AS "num_unsold_pieces",
          "total_loading_costs",
          "total_bundle_costs",
          0 AS "seller_net",
          "total_price1" AS "buyer_net"
        FROM (${buyersSql})
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

  const topLogStatsSql = `
    SELECT 
      *,
      ${opts.language === "sl" ? "tree_species_name_slo" : "tree_species_name"} as "tree_species_name"
    FROM (
      SELECT 
        *,
        row_number() OVER (PARTITION BY "tree_species_id" ORDER BY "offered_price" DESC) as "sequence_num",
        "wpo"."offered_price" * "volume" as "offered_total_price"
      FROM (
        ${woodPiecesSql}
      ) as wpo
    ) AS wp
    LEFT JOIN "buyers" ON "buyers"."id" = "wp"."buyer_id"
    LEFT JOIN "tree_species" ON "wp"."tree_species_id" = "tree_species"."id"
    WHERE "sequence_num" <= 3 AND "offered_price" > 0
    ORDER BY "total_price" DESC
  `;

  let topLogsPerVolumeSpeciesResult: WoodPiece[] = [];
  try {
    topLogsPerVolumeSpeciesResult = (await db.select(
      topLogStatsSql,
      []
    )) as WoodPiece[];
  } catch (e) {
    info(JSON.stringify(e));
    throw e;
  }
  const topLogsPerVolumeSpeciesGrouped = groupBy(
    topLogsPerVolumeSpeciesResult,
    "tree_species_id"
  );

  const topLogTotalStatsSql = `
    SELECT 
      *,
      ${opts.language === "sl" ? "tree_species_name_slo" : "tree_species_name"} as "tree_species_name"
    FROM (
      SELECT 
        *,
        row_number() OVER (PARTITION BY "tree_species_id" ORDER BY "total_price" DESC) as "sequence_num",
        "wpo"."offered_price" * "volume" as "offered_total_price"
      FROM (
        ${woodPiecesSql}
      ) as wpo
    ) AS wp
    LEFT JOIN "buyers" ON "buyers"."id" = "wp"."buyer_id"
    LEFT JOIN "tree_species" ON "wp"."tree_species_id" = "tree_species"."id"
    WHERE "sequence_num" <= 3 AND "offered_price" > 0
    ORDER BY "total_price" DESC
  `;

  let topLogsTotalSpeciesResult: WoodPiece[] = [];
  try {
    topLogsTotalSpeciesResult = (await db.select(
      topLogTotalStatsSql,
      []
    )) as WoodPiece[];
  } catch (e) {
    info(JSON.stringify(e));
    throw e;
  }
  const topLogsTotalSpeciesGrouped = groupBy(
    topLogsTotalSpeciesResult,
    "tree_species_id"
  );

  const treeSpeciesCubatureStatsSql = `
  SELECT 
    ROUND(SUM("volume"), 2) as "total_volume", 
    "tree_species_id" 
  FROM (
    ${woodPiecesSql}
  ) AS wp
  GROUP BY "tree_species_id"
`;

  let treeSpeciesCubatureResult: {
    total_volume: number;
    tree_species_id: number;
  }[] = [];
  try {
    treeSpeciesCubatureResult = (await db.select(
      treeSpeciesCubatureStatsSql,
      []
    )) as { total_volume: number; tree_species_id: number }[];
  } catch (e) {
    info(JSON.stringify(e));
    throw e;
  }
  const treeSpeciesCubatureGrouped = keyBy(
    treeSpeciesCubatureResult,
    "tree_species_id"
  );

  let treeSpecies: TreeSpeciesWithStats[] = (await ensureTreeSpecies({
    language: opts.language,
  })) as any;

  treeSpecies = treeSpecies.map((ts) => {
    ts.top_logs_per_volume = topLogsPerVolumeSpeciesGrouped[ts.id];
    ts.top_logs_total = topLogsTotalSpeciesGrouped[ts.id];
    ts.volume = treeSpeciesCubatureGrouped[ts.id]?.total_volume;
    return ts;
  });

  const topLogs: WoodPieceStats = {
    top_logs_per_volume: topLogsPerVolumeSpeciesResult.slice(0, 3), // reuse the top logs per species result and take the first three
    top_logs_total: topLogsTotalSpeciesResult.slice(0, 3), // reuse the top logs per species result and take the first three
  };

  const averagePerSpeciesSql = `
    SELECT 
      *,
      ROUND(AVG("offered_price"), 2) as "avg_offered_price",
      ${opts.language === "sl" ? "tree_species_name_slo" : "tree_species_name"} as "tree_species_name"
    FROM (
      SELECT 
        *,
        "wpo"."offered_price" * "volume" as "offered_total_price"
      FROM (
        ${woodPiecesSql}
      ) as wpo
    ) AS wp
    LEFT JOIN "tree_species" ON "wp"."tree_species_id" = "tree_species"."id"
    WHERE "offered_price" > 0
    GROUP BY "tree_species"."id"
  `;

  let averagePerSpeciesResult: TreeSpeciesWithStats[] = [];
  try {
    averagePerSpeciesResult = (await db.select(
      averagePerSpeciesSql,
      []
    )) as TreeSpeciesWithStats[];
  } catch (e) {
    info(JSON.stringify(e));
    throw e;
  }
  const averagePerSpeciesKeyed = keyBy(averagePerSpeciesResult, "id");

  const statistics: Statistics = {
    num_wood_pieces: priceResult[0].num_wood_pieces,
    num_unsold_wood_pieces: priceResult[0].num_unsold_wood_pieces,
    offered_max_price: priceResult[0].offered_max_price,
    total_volume: priceResult[0].total_volume,
    total_income: priceResult[0].total_income,
    costs_below_350: priceResult[0].costs_below_350,
    costs_above_350: priceResult[0].costs_above_350,
    total_logging_costs: priceResult[0].total_logging_costs,
    total_transport_costs: priceResult[0].total_transport_costs,
    total_bundle_costs: priceResult[0].total_bundle_costs,
    total_loading_costs: priceResult[0].total_loading_costs,
    sellers_net: priceResult[0].sellers_net,
    buyers_net: priceResult[0].buyers_net,
    seller_costs: priceResult[0].seller_costs,
    buyer_costs: priceResult[0].buyer_costs,

    top_logs_by_species: treeSpecies,
    top_logs: topLogs,
    stats_by_species: averagePerSpeciesKeyed,
  };
  return statistics;
};

export const statsQueryOptions = (opts: ListOptions) =>
  queryOptions({
    queryKey: ["statistics", opts],
    queryFn: () => ensureStats(opts),
    staleTime: Infinity,
  });
