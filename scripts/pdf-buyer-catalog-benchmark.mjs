import React from "react";
import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
  pdf,
} from "@react-pdf/renderer";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    backgroundColor: "#fff",
    fontSize: 10,
    padding: 24,
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 8,
  },
  section: {
    marginBottom: 10,
  },
  table: {
    width: "100%",
    borderStyle: "solid",
    borderColor: "#555",
    borderWidth: 1,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  row: {
    flexDirection: "row",
  },
  headerCell: {
    borderStyle: "solid",
    borderColor: "#555",
    borderWidth: 1,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    backgroundColor: "#e6e6e6",
    paddingHorizontal: 3,
    paddingVertical: 2,
    fontWeight: "bold",
  },
  cell: {
    borderStyle: "solid",
    borderColor: "#555",
    borderWidth: 1,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    paddingHorizontal: 3,
    paddingVertical: 2,
  },
  pageNumbers: {
    marginTop: 6,
    fontSize: 9,
  },
});

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

const defaultOptions = {
  woodItems: 1600,
  offers: 1000,
  runs: 3,
  warmup: true,
  jsonPath: "",
};

const now = () => (globalThis.performance ? performance.now() : Date.now());

const round = (value, digits = 2) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const randomFn = (seedValue) => {
  let seed = seedValue >>> 0;
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
};

const parseOptions = (argv) => {
  const options = { ...defaultOptions };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];

    if (arg === "--wood-items") {
      options.woodItems = Number(next);
      i += 1;
      continue;
    }
    if (arg === "--offers") {
      options.offers = Number(next);
      i += 1;
      continue;
    }
    if (arg === "--runs") {
      options.runs = Number(next);
      i += 1;
      continue;
    }
    if (arg === "--json") {
      options.jsonPath = next || "";
      i += 1;
      continue;
    }
    if (arg === "--no-warmup") {
      options.warmup = false;
      continue;
    }
    if (arg === "--help") {
      options.help = true;
      continue;
    }
  }

  if (
    !Number.isFinite(options.woodItems) ||
    !Number.isFinite(options.offers) ||
    !Number.isFinite(options.runs) ||
    options.woodItems <= 0 ||
    options.offers < 0 ||
    options.runs <= 0
  ) {
    throw new Error(
      "Invalid numeric arguments. Example: --wood-items 1600 --offers 1000 --runs 3"
    );
  }

  return options;
};

const registerFonts = () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const fontRegular = path.resolve(root, "src/assets/fonts/Roboto-Regular.ttf");
  const fontBold = path.resolve(root, "src/assets/fonts/Roboto-Bold.ttf");

  Font.register({
    family: "Roboto",
    src: fontRegular,
    fontWeight: "normal",
    fontStyle: "normal",
  });
  Font.register({
    family: "Roboto",
    src: fontBold,
    fontWeight: "bold",
    fontStyle: "normal",
  });
};

const createDataset = (woodItemsCount, offersCount) => {
  const woodRand = randomFn(7);
  const offerRand = randomFn(17);
  const woodPieces = [];
  const offers = [];
  const statsByPiece = new Map();
  let totalVolume = 0;

  for (let i = 1; i <= woodItemsCount; i += 1) {
    const width = 25 + Math.floor(woodRand() * 75);
    const length = round(2 + woodRand() * 4.5, 2);
    const volume = round((width / 100) * (width / 100) * length * 0.79, 3);
    woodPieces.push({
      id: i,
      sequence_no: i,
      plate_no: i,
      tree_species_name: species[(i - 1) % species.length],
      width,
      length,
      volume,
      seller_ident: `SI-${String((i % 25) + 1).padStart(3, "0")}`,
    });
    totalVolume += volume;
  }

  for (let i = 0; i < offersCount; i += 1) {
    const woodPieceId = Math.floor(offerRand() * woodItemsCount) + 1;
    const offeredPrice = round(140 + offerRand() * 280, 2);
    offers.push({
      wood_piece_id: woodPieceId,
      offered_price: offeredPrice,
    });

    const existing = statsByPiece.get(woodPieceId);
    if (!existing) {
      statsByPiece.set(woodPieceId, { count: 1, maxPrice: offeredPrice });
      continue;
    }
    existing.count += 1;
    if (offeredPrice > existing.maxPrice) {
      existing.maxPrice = offeredPrice;
    }
  }

  let offeredMaxPrice = 0;
  const rows = woodPieces.map((piece) => {
    const offerStat = statsByPiece.get(piece.id);
    const maxPrice = offerStat ? offerStat.maxPrice : 0;
    if (maxPrice > offeredMaxPrice) {
      offeredMaxPrice = maxPrice;
    }

    return {
      seq: String(piece.sequence_no),
      plate: String(piece.plate_no),
      species: piece.tree_species_name,
      width: String(piece.width),
      length: piece.length.toFixed(1),
      volume: piece.volume.toFixed(2),
      offeredPrice: maxPrice > 0 ? maxPrice.toFixed(2) : "",
    };
  });

  return {
    rows,
    statistics: {
      numWoodPieces: woodPieces.length,
      numUnsoldWoodPieces: woodPieces.length - statsByPiece.size,
      totalVolume: round(totalVolume, 3),
      offeredMaxPrice: round(offeredMaxPrice, 2),
    },
    offerStats: {
      offersTotal: offers.length,
      woodItemsWithOffers: statsByPiece.size,
    },
  };
};

const tableColumnSizes = [9, 12, 27, 10, 10, 10, 22];
const rowsPerPage = 38;

const chunkRows = (rows, size) => {
  const chunks = [];
  for (let i = 0; i < rows.length; i += size) {
    chunks.push(rows.slice(i, i + size));
  }
  return chunks;
};

const createTablePage = (rows, pageIndex) =>
  React.createElement(
    Page,
    { size: "A4", style: styles.page, key: `table-page-${pageIndex}` },
    React.createElement(
      View,
      { style: styles.table },
      React.createElement(
        View,
        { style: styles.row, fixed: true },
        ["Seq", "Plate", "Tree species", "W", "L", "Vol", "Offered"].map(
          (label, index) =>
            React.createElement(
              View,
              {
                style: [styles.headerCell, { width: `${tableColumnSizes[index]}%` }],
                key: `header-${pageIndex}-${label}`,
              },
              React.createElement(Text, null, label)
            )
        )
      ),
      rows.map((row, rowIndex) =>
        React.createElement(
          View,
          { style: styles.row, key: `row-${pageIndex}-${rowIndex}` },
          [
            row.seq,
            row.plate,
            row.species,
            row.width,
            row.length,
            row.volume,
            row.offeredPrice,
          ].map((value, cellIndex) =>
            React.createElement(
              View,
              {
                style: [styles.cell, { width: `${tableColumnSizes[cellIndex]}%` }],
                key: `cell-${pageIndex}-${rowIndex}-${cellIndex}`,
              },
              React.createElement(Text, null, value)
            )
          )
        )
      )
    ),
    React.createElement(Text, {
      style: styles.pageNumbers,
      fixed: true,
      render: ({ pageNumber, totalPages }) => `${pageNumber - 1} / ${totalPages - 1}`,
    })
  );

const buildDocument = (dataset) => {
  const rowPages = chunkRows(dataset.rows, rowsPerPage);

  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      React.createElement(Text, { style: styles.title }, "Wood auction"),
      React.createElement(
        Text,
        { style: styles.subtitle },
        "Buyer catalogue benchmark"
      ),
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(
          Text,
          null,
          `Wood items: ${dataset.statistics.numWoodPieces}`
        ),
        React.createElement(
          Text,
          null,
          `Offers: ${dataset.offerStats.offersTotal} (on ${dataset.offerStats.woodItemsWithOffers} items)`
        ),
        React.createElement(
          Text,
          null,
          `Total volume: ${dataset.statistics.totalVolume.toFixed(2)} m3`
        ),
        React.createElement(
          Text,
          null,
          `Max offered price: ${dataset.statistics.offeredMaxPrice.toFixed(2)} EUR/m3`
        )
      )
    ),
    ...rowPages.map((rows, index) => createTablePage(rows, index + 1))
  );
};

const readStreamBytes = (stream) =>
  new Promise((resolve, reject) => {
    let bytes = 0;
    stream.on("data", (chunk) => {
      bytes += chunk.length;
    });
    stream.on("end", () => resolve(bytes));
    stream.on("error", reject);
  });

const benchmarkRun = async (runNumber, options) => {
  const totalStart = now();

  const dataStart = now();
  const dataset = createDataset(options.woodItems, options.offers);
  const dataEnd = now();

  const stringifyStart = now();
  const serialized = JSON.stringify(dataset);
  const stringifyEnd = now();

  const parseStart = now();
  const parsed = JSON.parse(serialized);
  const parseEnd = now();

  const docStart = now();
  const doc = buildDocument(parsed);
  const docEnd = now();

  const toStreamStart = now();
  const stream = await pdf(doc).toBuffer();
  const toStreamEnd = now();

  const streamReadStart = now();
  const outputBytes = await readStreamBytes(stream);
  const streamReadEnd = now();

  const totalEnd = now();

  return {
    run: runNumber,
    dataMs: round(dataEnd - dataStart),
    stringifyMs: round(stringifyEnd - stringifyStart),
    parseMs: round(parseEnd - parseStart),
    documentMs: round(docEnd - docStart),
    toStreamMs: round(toStreamEnd - toStreamStart),
    streamReadMs: round(streamReadEnd - streamReadStart),
    renderTotalMs: round(streamReadEnd - toStreamStart),
    totalMs: round(totalEnd - totalStart),
    outputBytes,
  };
};

const avg = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;

const printHelp = () => {
  console.log("Buyer catalog PDF benchmark");
  console.log("Usage:");
  console.log(
    "  yarn bench:pdf:buyer-catalog --wood-items 1600 --offers 1000 --runs 3 [--no-warmup] [--json /tmp/report.json]"
  );
};

const main = async () => {
  const options = parseOptions(process.argv);
  if (options.help) {
    printHelp();
    return;
  }

  const fontStart = now();
  registerFonts();
  const fontEnd = now();

  if (options.warmup) {
    await benchmarkRun(0, options);
  }

  const runs = [];
  for (let run = 1; run <= options.runs; run += 1) {
    runs.push(await benchmarkRun(run, options));
  }

  const summary = {
    avgDataMs: round(avg(runs.map((run) => run.dataMs))),
    avgStringifyMs: round(avg(runs.map((run) => run.stringifyMs))),
    avgParseMs: round(avg(runs.map((run) => run.parseMs))),
    avgDocumentMs: round(avg(runs.map((run) => run.documentMs))),
    avgToStreamMs: round(avg(runs.map((run) => run.toStreamMs))),
    avgStreamReadMs: round(avg(runs.map((run) => run.streamReadMs))),
    avgRenderTotalMs: round(avg(runs.map((run) => run.renderTotalMs))),
    avgTotalMs: round(avg(runs.map((run) => run.totalMs))),
    minTotalMs: round(Math.min(...runs.map((run) => run.totalMs))),
    maxTotalMs: round(Math.max(...runs.map((run) => run.totalMs))),
    avgOutputBytes: round(avg(runs.map((run) => run.outputBytes))),
    fontRegistrationMs: round(fontEnd - fontStart),
  };

  console.log("\nBuyer catalog PDF benchmark\n");
  console.log("Options:", {
    woodItems: options.woodItems,
    offers: options.offers,
    runs: options.runs,
    warmup: options.warmup,
  });
  console.table(
    runs.map((run) => ({
      run: run.run,
      data_ms: run.dataMs,
      stringify_ms: run.stringifyMs,
      parse_ms: run.parseMs,
      document_ms: run.documentMs,
      to_stream_ms: run.toStreamMs,
      stream_read_ms: run.streamReadMs,
      render_total_ms: run.renderTotalMs,
      total_ms: run.totalMs,
      output_bytes: run.outputBytes,
    }))
  );
  console.log("Summary:", summary);

  if (options.jsonPath) {
    const report = {
      timestamp: new Date().toISOString(),
      options: {
        woodItems: options.woodItems,
        offers: options.offers,
        runs: options.runs,
        warmup: options.warmup,
      },
      runs,
      summary,
    };
    await writeFile(options.jsonPath, JSON.stringify(report, null, 2), "utf8");
    console.log(`JSON report written to ${options.jsonPath}`);
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
