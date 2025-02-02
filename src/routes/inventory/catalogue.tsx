import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { save } from "@tauri-apps/plugin-dialog";
import { info } from "@tauri-apps/plugin-log";
import { useMemo } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { CatalogueExportForBuyers } from "../../components/CatalogueExportForBuyers";
import { CatalogueExportWithPrices } from "../../components/CatalogueExportWithPrices";
import { CustomTable } from "../../components/CustomTable";
import { TableCellReadonly } from "../../components/TableCellReadonly";
import { saveToPDF } from "../../utils/pdf";
import { statsQueryOptions } from "../../utils/statsService";
import { treeSpeciesQueryOptions } from "../../utils/treeSpeciesService";
import {
  WoodPiece,
  woodPiecesQueryOptions,
} from "../../utils/woodPieceService";

export const Route = createFileRoute("/inventory/catalogue")({
  component: CatalogueComponent,
});

function CatalogueComponent() {
  const { t, i18n } = useTranslation();

  const woodPiecesQuery = useSuspenseQuery(
    woodPiecesQueryOptions({
      ...Route.useLoaderDeps(),
      ...Route.useParams(),
      relations: [],
      language: i18n.language as "sl" | "en",
    })
  );
  const woodPieces = woodPiecesQuery.data;

  const statisticsQuery = useSuspenseQuery(
    statsQueryOptions({
      ...Route.useLoaderDeps(),
    })
  );
  const statistics = statisticsQuery.data;

  const treeSpeciesQuery = useSuspenseQuery(
    treeSpeciesQueryOptions({ language: i18n.language as "en" | "sl" })
  );
  const treeSpeciesData = treeSpeciesQuery.data;
  const treeSpeciesOptions = useMemo(
    () =>
      treeSpeciesData.map((ts) => ({
        value: ts.id,
        label: ts.tree_species_name,
      })),
    [treeSpeciesData]
  );

  const columns = useMemo<ColumnDef<WoodPiece>[]>(
    () => [
      {
        accessorKey: "sequence_no",
        header: () => t("seqNo"),
        size: 70,
        meta: {
          type: "integer",
        },
      },
      {
        accessorKey: "plate_no",
        header: () => t("plateNo"),
        size: 100,
      },
      {
        accessorKey: "tree_species_name",
        header: () => t("treeSpecies"),
        size: 200,
      },
      {
        accessorKey: "width",
        header: () => t("widthCm"),
        size: 80,
        meta: {
          type: "integer",
        },
      },
      {
        accessorKey: "length",
        header: () => t("lengthM"),
        size: 80,
        meta: {
          type: "float",
          decimalPlaces: 1,
        },
      },
      {
        accessorKey: "volume",
        header: () => t("volumeM3"),
        size: 80,
        meta: {
          type: "float",
        },
      },
      {
        accessorKey: "ident",
        header: () => t("sellerIdent"),
        size: 200,
      },
    ],
    [treeSpeciesOptions]
  );

  const table = useReactTable({
    data: woodPieces,
    columns,
    getCoreRowModel: getCoreRowModel(),
    defaultColumn: {
      cell: TableCellReadonly,
    },
    meta: {},
  });

  const exportToFileForBuyers = async () => {
    const path = await save({
      filters: [
        {
          name: "pdf",
          extensions: ["pdf"],
        },
      ],
      defaultPath: t("sellingCatalogue").replace(" ", "-"),
    });
    let toastId: string;
    if (path) {
      toastId = toast.loading(t("generating"), {});
      try {
        saveToPDF(
          path,
          <CatalogueExportForBuyers
            woodPiecesData={woodPieces}
            statistics={statistics}
          />
        );
      } catch (e) {
        let error = e as Error;
        toast.error(
          `${JSON.stringify(error)} ${error.message} ${error.name} ${error.cause} ${error.stack}`,
          {
            duration: 10000,
          }
        );
        throw e;
      } finally {
        toast.dismiss(toastId);
      }

      // TODO: comment out
      // await openPath(path);
      toast.success(t("success"));
    }
  };

  const exportToFileWithPrices = async () => {
    const path = await save({
      filters: [
        {
          name: "pdf",
          extensions: ["pdf"],
        },
      ],
      defaultPath: "catalog",
    });
    let toastId: string;
    if (path) {
      toastId = toast.loading(t("generating"));
      try {
        saveToPDF(
          path,
          <CatalogueExportWithPrices
            woodPiecesData={woodPieces}
            statistics={statistics}
          />
        );
      } catch (e) {
        info(JSON.stringify(e));
        let error = e as Error;
        toast.error(`${JSON.stringify(error)}`);

        throw e;
      } finally {
        toast.dismiss(toastId);
      }

      toast.success(t("success"));
      // await openPath(path);
    }
  };

  return (
    <div>
      <div className="p-3">
        <div className="flex flex-row space-x-3 mb-3">
          <button
            className="bg-blue-400 rounded p-2 uppercase text-white font-black disabled:opacity-50 h-10"
            onClick={exportToFileForBuyers}
          >
            {t("exportForBuyers")}
          </button>
          <button
            className="bg-blue-400 rounded p-2 uppercase text-white font-black disabled:opacity-50 h-10"
            onClick={exportToFileWithPrices}
          >
            {t("exportWithPrices")}
          </button>
        </div>
      </div>
      <CustomTable
        table={table}
        trClassName="border-b"
        trhClassName="border-b"
        containerClassName="p-3 h-[calc(100vh-172px)]"
      />
    </div>
  );
}
