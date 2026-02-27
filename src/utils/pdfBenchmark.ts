import { PdfTypeEnum, pdfWorker } from "./pdf";
import type { Statistics } from "./statsService";
import type { WoodPiece } from "./woodPieceService";

interface BenchmarkOffer {
  wood_piece_id: number;
  offered_price: number;
}

export interface PdfBenchmarkOptions {
  woodItems: number;
  offers: number;
  runs: number;
  warmup: boolean;
  language: "en" | "sl";
  type: PdfTypeEnum.catalogForBuyers | PdfTypeEnum.catalogWithPrices;
}

interface PdfBenchmarkRun {
  run: number;
  serializationMs: number;
  renderMs: number;
  totalMs: number;
  outputBytes: number;
}

export interface PdfBenchmarkResult {
  options: PdfBenchmarkOptions;
  dataset: {
    woodItems: number;
    offers: number;
    woodItemsWithOffers: number;
    totalVolume: number;
  };
  runs: PdfBenchmarkRun[];
  summary: {
    avgSerializationMs: number;
    avgRenderMs: number;
    avgTotalMs: number;
    minTotalMs: number;
    maxTotalMs: number;
  };
}

const round = (value: number, digits: number) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const createRandom = (seedStart = 42) => {
  let seed = seedStart >>> 0;
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
};

const now = () =>
  typeof performance !== "undefined" ? performance.now() : Date.now();

const species = [
  "Spruce",
  "Oak",
  "Beech",
  "Maple",
  "Ash",
  "Pine",
  "Larch",
  "Fir",
];

const emptyStatistics = (): Statistics => ({
  total_volume: 0,
  num_wood_pieces: 0,
  num_unsold_wood_pieces: 0,
  offered_max_price: 0,
  total_income: 0,
  costs_below_350: 0,
  total_logging_costs: 0,
  total_transport_costs: 0,
  total_bundle_costs: 0,
  total_loading_costs: 0,
  costs_above_350: 0,
  sellers_net: 0,
  buyers_net: 0,
  top_logs_by_species: [],
  stats_by_species: {},
  top_logs: {},
  seller_costs: 0,
  buyer_costs: 0,
});

const createWoodItems = (count: number): WoodPiece[] => {
  const rand = createRandom(7);
  const items: WoodPiece[] = [];

  for (let i = 1; i <= count; i += 1) {
    const width = 25 + Math.floor(rand() * 75);
    const length = round(2 + rand() * 4.5, 2);
    const volume = round((width / 100) * (width / 100) * length * 0.79, 3);
    const treeSpeciesId = (i % species.length) + 1;

    items.push({
      id: i,
      wood_piece_name: `Wood piece ${i}`,
      seller_id: (i % 25) + 1,
      tree_species_id: treeSpeciesId,
      length,
      width,
      volume,
      plate_no: i,
      sequence_no: i,
      seller_name: `Seller ${(i % 25) + 1}`,
      tree_species_name: species[treeSpeciesId - 1],
      ident: `SI-${String((i % 25) + 1).padStart(3, "0")}`,
    });
  }

  return items;
};

const createOffers = (woodItems: number, count: number): BenchmarkOffer[] => {
  const rand = createRandom(17);
  const offers: BenchmarkOffer[] = [];

  for (let i = 0; i < count; i += 1) {
    offers.push({
      wood_piece_id: Math.floor(rand() * woodItems) + 1,
      offered_price: round(140 + rand() * 280, 2),
    });
  }

  return offers;
};

const createBenchmarkPayload = (options: PdfBenchmarkOptions) => {
  const woodPiecesData = createWoodItems(options.woodItems);
  const offers = createOffers(options.woodItems, options.offers);
  const offerStats = new Map<number, { count: number; maxPrice: number }>();

  for (const offer of offers) {
    const existing = offerStats.get(offer.wood_piece_id);
    if (existing) {
      existing.count += 1;
      existing.maxPrice = Math.max(existing.maxPrice, offer.offered_price);
      continue;
    }
    offerStats.set(offer.wood_piece_id, {
      count: 1,
      maxPrice: offer.offered_price,
    });
  }

  let totalVolume = 0;
  let offeredMaxPrice = 0;

  for (const piece of woodPiecesData) {
    totalVolume += piece.volume;
    const pieceOffers = offerStats.get(piece.id);
    if (!pieceOffers) {
      continue;
    }
    offeredMaxPrice = Math.max(offeredMaxPrice, pieceOffers.maxPrice);
    piece.num_offers = pieceOffers.count;
    piece.offered_price = pieceOffers.maxPrice;
    piece.offered_total_price = round(pieceOffers.maxPrice * piece.volume, 2);
  }

  const statistics = emptyStatistics();
  statistics.num_wood_pieces = woodPiecesData.length;
  statistics.num_unsold_wood_pieces = woodPiecesData.length - offerStats.size;
  statistics.total_volume = round(totalVolume, 3);
  statistics.offered_max_price = round(offeredMaxPrice, 2);

  return {
    props: {
      woodPiecesData,
      statistics,
    },
    dataset: {
      woodItems: woodPiecesData.length,
      offers: offers.length,
      woodItemsWithOffers: offerStats.size,
      totalVolume: statistics.total_volume,
    },
  };
};

const average = (items: number[]) =>
  items.reduce((sum, val) => sum + val, 0) / items.length;

export const runPdfBenchmark = async (
  partialOptions: Partial<PdfBenchmarkOptions> = {}
): Promise<PdfBenchmarkResult> => {
  const options: PdfBenchmarkOptions = {
    woodItems: partialOptions.woodItems ?? 1600,
    offers: partialOptions.offers ?? 1000,
    runs: partialOptions.runs ?? 3,
    warmup: partialOptions.warmup ?? true,
    language: partialOptions.language ?? "en",
    type: partialOptions.type ?? PdfTypeEnum.catalogForBuyers,
  };
  const payload = createBenchmarkPayload(options);
  const runs: PdfBenchmarkRun[] = [];

  if (options.warmup) {
    await pdfWorker.renderPDFInWorker(
      JSON.stringify(payload.props),
      options.type,
      options.language
    );
  }

  for (let run = 1; run <= options.runs; run += 1) {
    const totalStart = now();
    const serializationStart = now();
    const serializedData = JSON.stringify(payload.props);
    const serializationEnd = now();
    const renderStart = now();
    const output = await pdfWorker.renderPDFInWorker(
      serializedData,
      options.type,
      options.language
    );
    const renderEnd = now();
    const totalEnd = now();

    runs.push({
      run,
      serializationMs: round(serializationEnd - serializationStart, 2),
      renderMs: round(renderEnd - renderStart, 2),
      totalMs: round(totalEnd - totalStart, 2),
      outputBytes: output.byteLength,
    });
  }

  const totals = runs.map((run) => run.totalMs);
  const serializations = runs.map((run) => run.serializationMs);
  const renders = runs.map((run) => run.renderMs);

  return {
    options,
    dataset: payload.dataset,
    runs,
    summary: {
      avgSerializationMs: round(average(serializations), 2),
      avgRenderMs: round(average(renders), 2),
      avgTotalMs: round(average(totals), 2),
      minTotalMs: round(Math.min(...totals), 2),
      maxTotalMs: round(Math.max(...totals), 2),
    },
  };
};

export const runBuyerCatalogBenchmark = (
  partialOptions: Partial<PdfBenchmarkOptions> = {}
) =>
  runPdfBenchmark({
    woodItems: 1600,
    offers: 1000,
    runs: 3,
    warmup: true,
    language: "en",
    ...partialOptions,
    type: PdfTypeEnum.catalogForBuyers,
  });

declare global {
  interface Window {
    runBuyerCatalogBenchmark?: (
      partialOptions?: Partial<PdfBenchmarkOptions>
    ) => Promise<PdfBenchmarkResult>;
  }
}

export const registerPdfBenchmarksOnWindow = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.runBuyerCatalogBenchmark = async (partialOptions = {}) => {
    const result = await runBuyerCatalogBenchmark(partialOptions);
    console.table(
      result.runs.map((run) => ({
        run: run.run,
        serialization_ms: run.serializationMs,
        render_ms: run.renderMs,
        total_ms: run.totalMs,
        output_bytes: run.outputBytes,
      }))
    );
    console.info("buyer_catalog_benchmark", {
      options: result.options,
      dataset: result.dataset,
      summary: result.summary,
    });
    return result;
  };
};
