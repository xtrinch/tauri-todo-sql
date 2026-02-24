import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { save } from "@tauri-apps/plugin-dialog";
import { openPath } from "@tauri-apps/plugin-opener";
import { useMemo } from "react";
import { FaFilePdf } from "react-icons/fa6";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { CustomTable } from "../../components/CustomTable";
import { FooterAddCell } from "../../components/FooterAddCell";
import { RemoveCell } from "../../components/RemoveCell";
import { TableCell } from "../../components/TableCell";
import {
  TreeSpecies,
  treeSpeciesQueryOptions,
  useCreateTreeSpeciesMutation,
  useRemoveTreeSpeciesMutation,
  useUpdateTreeSpeciesMutation,
} from "../../utils/treeSpeciesService";
import { WoodPiece } from "../../utils/woodPieceService";
import { PdfTypeEnum, saveToPDF } from "../../utils/pdf";

export const Route = createFileRoute("/treeSpecies/edit")({
  component: TreeSpeciesEdit,
});

function TreeSpeciesEdit() {
  const { t, i18n } = useTranslation();

  const createTreeSpeciesMutation = useCreateTreeSpeciesMutation({
    onError: () => {
      toast.error(t("couldNotCreate"));
    },
  });
  const removeTreeSpeciesMutation = useRemoveTreeSpeciesMutation({
    onError: () => {
      toast.error(t("couldNotDelete"));
    },
  });
  const updateTreeSpeciesMutation = useUpdateTreeSpeciesMutation({
    onError: () => {
      toast.error(t("couldNotUpdate"));
    },
  });

  const treeSpeciesQuery = useSuspenseQuery(
    treeSpeciesQueryOptions({ language: i18n.language as "en" | "sl" })
  );
  const treeSpeciesData = treeSpeciesQuery.data;

  const columns = useMemo<ColumnDef<TreeSpecies>[]>(
    () => [
      {
        accessorKey: "tree_species_name_slo",
        header: () => t("sloName"),
        size: 220,
        meta: {},
      },
      {
        accessorKey: "latin_name",
        header: () => t("latinName"),
        size: 220,
        meta: {},
      },
      {
        accessorKey: "tree_species_name_en",
        header: () => t("englishName"),
        size: 220,
        meta: {},
      },
      {
        id: "1",
        header: () => "",
        size: 45,
        accessorFn: () => 1,
        meta: {
          readonly: true,
        },
        cell: RemoveCell,
        footer: (info) => {
          return <FooterAddCell table={info.table} />;
        },
      },
    ],
    [treeSpeciesData]
  );

  const table = useReactTable({
    data: treeSpeciesData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    defaultColumn: {
      cell: TableCell,
    },
    meta: {
      onAdd: () => {
        createTreeSpeciesMutation.mutate({});
      },
      onEdit: (data: WoodPiece) => {
        updateTreeSpeciesMutation.mutate(data);
      },
      onRemove: (treeSpeciesId: number) => {
        removeTreeSpeciesMutation.mutate({ id: treeSpeciesId });
      },
    },
  });

  const exportToFile = async () => {
    const path = await save({
      filters: [
        {
          name: "pdf",
          extensions: ["pdf"],
        },
      ],
      defaultPath: t("treeSpeciesPDFName"),
    });
    let toastId: string;
    if (path) {
      toastId = toast.loading(t("generating"), {
        position: "top-center",
      });
      try {
        await saveToPDF(
          path,
          { treeSpecies: treeSpeciesData },
          PdfTypeEnum.treeSpecies,
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
    <div className="p-3 h-[calc(100vh-53px)] flex flex-col">
      <div className="relative">
        <button
          className="absolute right-6 top-0 z-10 bg-blue-400 rounded p-2 uppercase text-white font-black disabled:opacity-50 h-10"
          onClick={exportToFile}
        >
          <span className="inline-flex items-center gap-2">
            <FaFilePdf aria-hidden />
            {t("exportTreeSpecies")}
          </span>
        </button>
      </div>
      <CustomTable
        table={table}
        containerClassName="flex-1 min-h-0 relative z-0"
        hasFooter={true}
      />
    </div>
  );
}
