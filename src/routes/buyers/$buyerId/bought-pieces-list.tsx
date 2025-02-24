import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { save } from "@tauri-apps/plugin-dialog";
import { openPath } from "@tauri-apps/plugin-opener";
import Big from "big.js";
import { compact } from "lodash";
import { useMemo } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { CustomTable } from "../../../components/CustomTable";
import { PdfTableCol } from "../../../components/PdfTable";
import { TableCellReadonly } from "../../../components/TableCellReadonly";
import { buyerQueryOptions } from "../../../utils/buyerService";
import { BUNDLE_PER_M3_COST } from "../../../utils/constants";
import { PdfTypeEnum, saveToPDF } from "../../../utils/pdf";
import {
  WoodPiece,
  woodPiecesQueryOptions,
} from "../../../utils/woodPieceService";

export const Route = createFileRoute("/buyers/$buyerId/bought-pieces-list")({
  component: BoughtPiecesList,
});

function BoughtPiecesList() {
  const { t, i18n } = useTranslation();

  const params = Route.useParams();

  const buyerQuery = useSuspenseQuery(buyerQueryOptions(params.buyerId));
  const buyer = buyerQuery.data;

  const woodPiecesQuery = useSuspenseQuery(
    woodPiecesQueryOptions({
      ...Route.useLoaderDeps(),
      buyer_id: params.buyerId,
      offered_price__isnotzero: true,
      relations: [],
      language: i18n.language as "sl" | "en",
    })
  );
  const woodPieces = woodPiecesQuery.data;

  const woodPiecesQueryGrouped = useSuspenseQuery(
    woodPiecesQueryOptions({
      ...Route.useLoaderDeps(),
      buyer_id: params.buyerId,
      groupBy_tree_species: true,
      relations: [],
      language: i18n.language as "sl" | "en",
    })
  );
  const woodPiecesGrouped = woodPiecesQueryGrouped.data;

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
        accessorKey: "offered_price",
        header: () => t("offeredPrice"),
        size: 80,
        meta: {
          type: "float",
          readonly: true,
        },
        cell: TableCellReadonly,
      },
      {
        accessorKey: "offered_total_price",
        header: () => t("totalPriceM3"),
        size: 80,
        meta: {
          type: "float",
          readonly: true,
        },
        cell: TableCellReadonly,
      },
    ],
    []
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

  const columnsGrouped = useMemo<ColumnDef<WoodPiece>[]>(
    () => [
      {
        accessorKey: "tree_species_name",
        header: () => t("treeSpecies"),
        size: 200,
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
        accessorKey: "offered_total_price",
        header: () => t("totalPriceM3"),
        size: 80,
        meta: {
          type: "float",
        },
      },
    ],
    []
  );

  const tableGrouped = useReactTable({
    data: woodPiecesGrouped,
    columns: columnsGrouped,
    getCoreRowModel: getCoreRowModel(),
    defaultColumn: {
      cell: TableCellReadonly,
    },
    meta: {},
  });

  const rows = table.getFilteredRowModel().rows;

  const { totalVolume, totalPrice } = useMemo(() => {
    return {
      totalVolume: rows
        .reduce(
          (sum: Big, row) => sum.plus(row.getValue("volume") as number),
          new Big(0)
        )
        .round(2),
      totalPrice: rows
        .reduce(
          (sum, row) => sum.plus(row.getValue("offered_total_price") as number),
          new Big(0)
        )
        .round(2),
    };
  }, [rows]);

  const bundleCosts = useMemo(
    () =>
      (buyer.used_bundle
        ? totalVolume.mul(BUNDLE_PER_M3_COST || 0)
        : new Big(0)
      ).round(2),
    [totalVolume, buyer]
  );

  const loadingCosts = useMemo(
    () =>
      (buyer.used_loading
        ? totalVolume.mul(buyer.loading_costs || 0)
        : new Big(0)
      ).round(2),
    [totalVolume, buyer]
  );

  const totalPriceBeforeTax = useMemo(() => {
    return totalPrice.plus(loadingCosts).plus(bundleCosts).round(2);
  }, [totalPrice, loadingCosts, bundleCosts]);

  const { buyerIncomeTaxVat } = useMemo(
    () => ({
      buyerIncomeTaxVat: (buyer.is_vat_liable &&
      totalPriceBeforeTax > new Big(0)
        ? totalPriceBeforeTax.mul(0.22)
        : new Big(0)
      ).round(2),
    }),
    [totalPriceBeforeTax, buyer]
  );

  const totalPriceGross = useMemo(() => {
    return totalPriceBeforeTax.plus(buyerIncomeTaxVat).round(2);
  }, [totalPriceBeforeTax, buyerIncomeTaxVat]);

  const columnsSummary = useMemo<PdfTableCol[]>(
    () => [
      {
        accessorKey: "label",
        size: 260,
        header: () => t("summary"),
      },
      {
        accessorKey: "value",
        size: 100,
      },
    ],
    []
  );

  const rows_summary: { label: string; value: string; bold?: boolean }[] =
    useMemo(
      () =>
        compact([
          { label: t("totalVolume"), value: `${totalVolume.toFixed(2)} m3` },
          { label: t("totalPrice"), value: `${totalPrice.toFixed(2)} EUR` },
          buyer.used_bundle > 0 && {
            label: `${t("bundleCosts")} (${(BUNDLE_PER_M3_COST || 0).toFixed(2)} EUR / m3)`,
            value: `${bundleCosts.toFixed(2)} EUR`,
          },
          buyer.used_loading > 0 && {
            label: `${t("loadingCosts")} (${(buyer.loading_costs || 0).toFixed(2)} EUR / m3)`,
            value: `${loadingCosts.toFixed(2)} EUR`,
          },
          buyer.is_vat_liable > 0 && {
            label: t("totalBeforeTax"),
            value: `${totalPriceBeforeTax.toFixed(2)} EUR`,
          },
          buyer.is_vat_liable > 0 && {
            label: t("vat"),
            value: `${buyerIncomeTaxVat.toFixed(2)} EUR`,
          },
          {
            label: t("totalGross"),
            value: `${totalPriceGross.toFixed(2)} EUR`,
          },
        ]),
      [i18n.language, totalVolume, totalPrice, totalPriceGross]
    );

  const exportToFile = async () => {
    const path = await save({
      filters: [
        {
          name: "Bought pieces Filter",
          extensions: ["pdf"],
        },
      ],
      defaultPath: t("boughtPiecesPDFName"),
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
            buyer: buyer,
            woodPiecesData: woodPieces,
            woodPiecesGroupedData: woodPiecesGrouped,
            rowsSummary: rows_summary,
            colsSummary: columnsSummary,
          },
          PdfTypeEnum.boughtPieces,
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

  const columns_summary = useMemo<PdfTableCol[]>(
    () => [
      {
        accessorKey: "label",
        size: 260,
        header: () => t("summary"),
      },
      {
        accessorKey: "value",
        size: 100,
      },
    ],
    []
  );

  return (
    <div className="p-3 flex flex-col space-y-3 h-[calc(100vh-279px)] overflow-auto">
      <div>
        <button
          className="bg-blue-400 rounded p-2 uppercase text-white font-black disabled:opacity-50 h-10"
          onClick={exportToFile}
        >
          {t("exportInvoice")}
        </button>
      </div>
      <div>
        <CustomTable
          table={table}
          trClassName="border-b"
          trhClassName="border-b"
        />
      </div>
      <div className="font-bold">{t("summary")}</div>
      <div>
        <CustomTable
          table={tableGrouped}
          trClassName="border-b"
          trhClassName="border-b"
        />
      </div>
      <table className="mt-5">
        <tbody>
          {rows_summary.map((row, index) => {
            return (
              <tr className="border-b" key={index}>
                {columns_summary.map((col, innerIndex) => (
                  <td
                    className={`px-2 py-2 ${row.bold ? "font-bold" : ""}`}
                    key={innerIndex}
                  >
                    {(row as any)[col.accessorKey]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
