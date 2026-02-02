import { queryOptions } from "@tanstack/react-query";
import { info } from "@tauri-apps/plugin-log";
import { groupBy } from "lodash";
import { getDatabase } from "./database";
import { ensureTreeSpecies, TreeSpecies } from "./treeSpeciesService";
import { WoodPiece } from "./woodPieceService";

interface TreeSpeciesWithStats extends TreeSpecies {
  top_pieces_by_thickness?: WoodPiece[];
}

export interface BuyersStatistics {
  top_pieces_by_species: TreeSpeciesWithStats[];
}

interface ListOptions {
  language?: "en" | "sl";
  limit: number;
}

const ensureStatsForBuyers = async (opts: ListOptions): Promise<BuyersStatistics> => {
  const db = await getDatabase();
  const limit = Math.max(1, opts.limit || 1);

  const woodPiecesSql = `
    SELECT --- this one selects all wood pieces flattened
      *,
      "wood_pieces"."id" as "wp_id"
    FROM "wood_pieces"
    LEFT JOIN "sellers" ON "wood_pieces"."seller_id" = "sellers"."id"
  `;

  const topByThicknessSql = `
    SELECT 
      *,
      ${opts.language === "sl" ? "tree_species_name_slo" : "tree_species_name"} as "tree_species_name"
    FROM (
      SELECT 
        *,
        row_number() OVER (
          PARTITION BY "tree_species_id" 
          ORDER BY "width" DESC, "length" DESC, "volume" DESC
        ) as "sequence_num"
      FROM (
        ${woodPiecesSql}
      ) as wpo
    ) AS wp
    LEFT JOIN "tree_species" ON "wp"."tree_species_id" = "tree_species"."id"
    WHERE "sequence_num" <= $1 AND "width" > 0
    ORDER BY "tree_species_id" ASC, "width" DESC, "length" DESC, "volume" DESC
  `;

  let topByThicknessResult: WoodPiece[] = [];
  try {
    topByThicknessResult = (await db.select(
      topByThicknessSql,
      [limit]
    )) as WoodPiece[];
  } catch (e) {
    info(JSON.stringify(e));
    throw e;
  }

  const topByThicknessGrouped = groupBy(
    topByThicknessResult,
    "tree_species_id"
  );

  let treeSpecies: TreeSpeciesWithStats[] = (await ensureTreeSpecies({
    language: opts.language,
  })) as any;

  treeSpecies = treeSpecies
    .map((ts) => {
      ts.top_pieces_by_thickness = topByThicknessGrouped[ts.id] || [];
      return ts;
    })
    .filter((ts) => ts.top_pieces_by_thickness?.length);

  return {
    top_pieces_by_species: treeSpecies,
  };
};

export const statsForBuyersQueryOptions = (opts: ListOptions) =>
  queryOptions({
    queryKey: ["statistics", "buyers", opts],
    queryFn: () => ensureStatsForBuyers(opts),
    staleTime: Infinity,
  });
