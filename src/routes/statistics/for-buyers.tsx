import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { FaFilePdf } from "react-icons/fa6";
import { useTranslation } from "react-i18next";
import { CustomTable } from "../../components/CustomTable";
import { TableCellReadonly } from "../../components/TableCellReadonly";
import { PdfTypeEnum, saveToPDF } from "../../utils/pdf";
import {
  BuyersTopMeasure,
  statsForBuyersQueryOptions,
} from "../../utils/statsForBuyersService";
import { WoodPiece } from "../../utils/woodPieceService";
import { save } from "@tauri-apps/plugin-dialog";
import { openPath } from "@tauri-apps/plugin-opener";
import toast from "react-hot-toast";

export const Route = createFileRoute("/statistics/for-buyers")({
  component: StatisticsForBuyersComponent,
});

const defaultLimit = 20;
const limitDebounceMs = 350;
const defaultMeasure: BuyersTopMeasure = "thickness";

function StatisticsForBuyersComponent() {
  const { t, i18n } = useTranslation();
  const [limitInput, setLimitInput] = useState<string>(String(defaultLimit));
  const [limit, setLimit] = useState<number>(defaultLimit);
  const [measure, setMeasure] = useState<BuyersTopMeasure>(defaultMeasure);

  useEffect(() => {
    const trimmed = limitInput.trim();
    const parsed = Number(trimmed);
    if (!trimmed || Number.isNaN(parsed)) {
      return;
    }
    const nextLimit = Math.max(1, Math.floor(parsed));
    const handle = window.setTimeout(() => {
      setLimit(nextLimit);
    }, limitDebounceMs);
    return () => window.clearTimeout(handle);
  }, [limitInput]);

  const statisticsQuery = useSuspenseQuery(
    statsForBuyersQueryOptions({
      ...Route.useLoaderDeps(),
      language: i18n.language as "en" | "sl",
      limit,
      measure,
    })
  );

  const speciesStats = statisticsQuery.data.top_pieces_by_species;

  const exportToFile = async () => {
    const path = await save({
      filters: [
        {
          name: "pdf",
          extensions: ["pdf"],
        },
      ],
      defaultPath: t("statisticsForBuyersPDFName"),
    });
    let toastId: string;
    if (path) {
      toastId = toast.loading(t("generating"), {
        position: "top-center",
      });
      try {
        await saveToPDF(
          path,
          {
            statistics: statisticsQuery.data,
            limit,
            measure,
          },
          PdfTypeEnum.statisticsForBuyers,
          i18n.language
        );
      } catch (e) {
        let error = e as Error;
        toast.error(`${error.message}`, {
          duration: 10000,
        });
        throw e;
      } finally {
        toast.dismiss(toastId);
      }

      await openPath(path);
      toast.success(t("success"));
    }
  };

  return (
    <div className="p-3 flex flex-col space-y-5">
      <div className="relative">
        <button
          className="absolute right-0 top-0 bg-blue-400 rounded p-2 uppercase text-white font-black disabled:opacity-50 h-10"
          onClick={exportToFile}
        >
          <span className="inline-flex items-center gap-2">
            <FaFilePdf aria-hidden />
            {t("exportStatisticsForBuyers")}
          </span>
        </button>
        <div className="flex flex-wrap items-center gap-3 min-w-0">
          <h3 className="font-bold text-lg">{t("topPiecesTitle")}</h3>
          <label className="flex items-center gap-2">
            <span className="text-sm text-gray-700">{t("topPiecesMeasure")}</span>
            <select
              className="border rounded px-2 py-1"
              value={measure}
              onChange={(event) =>
                setMeasure(event.target.value as BuyersTopMeasure)
              }
            >
              <option value="thickness">{t("topPiecesMeasureThickness")}</option>
              <option value="volume">{t("topPiecesMeasureVolume")}</option>
            </select>
          </label>
          <label className="flex items-center gap-2">
            <span className="text-sm text-gray-700">{t("topPiecesLimit")}</span>
            <input
              type="number"
              className="border rounded px-2 py-1 w-24"
              min={1}
              value={limitInput}
              onChange={(event) => {
                setLimitInput(event.target.value);
              }}
              onBlur={() => {
                const trimmed = limitInput.trim();
                const parsed = Number(trimmed);
                if (!trimmed || Number.isNaN(parsed)) {
                  setLimitInput(String(limit));
                  return;
                }
                const nextLimit = Math.max(1, Math.floor(parsed));
                setLimit(nextLimit);
                setLimitInput(String(nextLimit));
              }}
            />
          </label>
        </div>
      </div>
      {speciesStats.map((ts) => (
        <SpeciesStatsTable
          key={ts.id}
          title={ts.tree_species_name}
          totalPieces={ts.total_pieces || 0}
          totalVolume={ts.total_volume || 0}
          woodPieces={ts.top_pieces_by_thickness || []}
        />
      ))}
    </div>
  );
}

function SpeciesStatsTable(props: {
  title: string;
  totalPieces: number;
  totalVolume: number;
  woodPieces: WoodPiece[];
}) {
  const { t } = useTranslation();

  const columns = useMemo<ColumnDef<unknown, any>[]>(
    () => [
      {
        accessorKey: "sequence_no",
        size: 70,
        header: () => t("seqNo"),
        meta: {
          type: "integer",
        },
      },
      {
        accessorKey: "plate_no",
        size: 100,
        header: () => t("plateNo"),
      },
      {
        accessorKey: "width",
        size: 90,
        header: () => t("widthCm"),
        meta: {
          type: "integer",
        },
      },
      {
        accessorKey: "length",
        size: 90,
        header: () => t("lengthM"),
        meta: {
          type: "float",
          decimalPlaces: 1,
        },
      },
      {
        accessorKey: "volume",
        size: 90,
        header: () => t("volumeM3"),
        meta: {
          type: "float",
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: props.woodPieces,
    columns,
    getCoreRowModel: getCoreRowModel(),
    defaultColumn: {
      cell: TableCellReadonly,
    },
    meta: {},
  });

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-4">
        <h2 className="text-xl font-bold">{props.title}</h2>
        <div className="flex items-baseline gap-3 flex-wrap text-base text-gray-700">
          <div>
            {t("totalPieces")}: {props.totalPieces}
          </div>
          <div>
            {t("totalVolume")}: {props.totalVolume} m3
          </div>
        </div>
      </div>
      <CustomTable
        sizeEstimate={45}
        table={table}
        trClassName="border-b"
        trhClassName="border-b"
        containerClassName="!overflow-visible"
      />
    </div>
  );
}
