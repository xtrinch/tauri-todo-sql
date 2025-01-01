import { pdf } from "@react-pdf/renderer";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";
import { info } from "@tauri-apps/plugin-log";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CatalogueExport } from "../../components/CatalogueExport";
import { CustomTable } from "../../components/CustomTable";
import { DropdownCellReadonly } from "../../components/DropdownCellReadonly";
import { TableCellReadonly } from "../../components/TableCellReadonly";
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
        size: 60,
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
        accessorKey: "tree_species_id",
        header: () => t("treeSpecies"),
        size: 200,
        cell: (data) =>
          DropdownCellReadonly({
            ...data,
            choices: treeSpeciesOptions,
          }),
      },
      {
        accessorKey: "width",
        header: () => t("widthCm"),
        size: 80,
        meta: {
          type: "float",
        },
      },
      {
        accessorKey: "length",
        header: () => t("lengthM"),
        size: 80,
        meta: {
          type: "float",
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

  const exportToFile = async () => {
    const path = await save({
      filters: [
        {
          name: "Catalog Filter",
          extensions: ["pdf"],
        },
      ],
      defaultPath: "catalog",
    });
    if (path) {
      info(path);

      const blob = await pdf(
        <CatalogueExport woodPiecesData={woodPieces} />
      ).toBlob();
      // Convert Blob to ArrayBuffer
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // Write the PDF file to the file system
      await writeFile(path, uint8Array);
    }
  };

  return (
    <div>
      <button
        className="bg-blue-400 rounded p-2 uppercase text-white font-black disabled:opacity-50 h-10"
        onClick={exportToFile}
      >
        {t("export")}
      </button>
      <CustomTable
        table={table}
        trClassName="border-b"
        trhClassName="border-b"
      />
    </div>
  );
}
