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
import { useTranslation } from "react-i18next";
import { CustomTable } from "../../../components/CustomTable";
import { PdfTableCol } from "../../../components/PdfTable";
import { TableCellReadonly } from "../../../components/TableCellReadonly";
import {
  LICITATOR_350_PERCENTAGE,
  LICITATOR_FIXED_COST,
} from "../../../utils/constants";
import { PdfTypeEnum, saveToPDF } from "../../../utils/pdf";
import { sellerQueryOptions } from "../../../utils/sellerService";
import {
  WoodPiece,
  woodPiecesQueryOptions,
} from "../../../utils/woodPieceService";
export const Route = createFileRoute("/sellers/$sellerId/sold-pieces-list")({
  component: SoldPiecesList,
});

function SoldPiecesList() {
  const { t, i18n } = useTranslation();

  const params = Route.useParams();

  const sellerQuery = useSuspenseQuery(sellerQueryOptions(params.sellerId));
  const seller = sellerQuery.data;

  const woodPiecesQuery = useSuspenseQuery(
    woodPiecesQueryOptions({
      ...Route.useLoaderDeps(),
      seller_id: params.sellerId,
      relations: [],
      language: i18n.language as "sl" | "en",
    })
  );
  const woodPieces = woodPiecesQuery.data;

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
        accessorKey: "length",
        header: () => t("lengthM"),
        size: 80,
        meta: {
          type: "float",
          decimalPlaces: 1,
        },
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
        accessorKey: "volume",
        header: () => t("volumeM3"),
        size: 80,
        meta: {
          type: "float",
        },
      },
      {
        accessorKey: "offered_price",
        header: () => t("maxPriceM3"),
        size: 80,
        meta: {
          type: "float",
          readonly: true,
        },
      },
      {
        accessorKey: "offered_total_price",
        header: () => t("totalPriceM3"),
        size: 80,
        meta: {
          type: "float",
          readonly: true,
        },
      },
      {
        accessorKey: "buyer_name",
        header: () => t("buyer"),
        size: 180,
        meta: {
          readonly: true,
        },
      },
    ],
    []
  );

  const combinedRows = useMemo(() => {
    return woodPieces;
  }, [woodPieces]);

  const table = useReactTable({
    data: combinedRows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    defaultColumn: {
      cell: TableCellReadonly,
    },
    meta: {},
  });

  const rows = table.getFilteredRowModel().rows;

  const { totalVolume, totalPrice, costsBelow350, costsAbove350 } =
    useMemo(() => {
      return {
        totalVolume: rows
          .reduce(
            (sum: Big, row) => sum.plus(row.getValue("volume") as number),
            new Big(0)
          )
          .round(2),
        totalPrice: rows
          .reduce(
            (sum, row) =>
              sum.plus((row.getValue("offered_total_price") as number) || 0),
            new Big(0)
          )
          .round(2),
        costsBelow350: rows
          .reduce(
            (sum, row) =>
              sum.plus(
                new Big(LICITATOR_FIXED_COST).mul(
                  row.getValue("volume") as number
                )
              ),
            new Big(0)
          )
          .round(2),
        costsAbove350: rows
          .reduce((sum, row) => {
            if ((row.getValue("offered_price") as number) <= 350) {
              return sum;
            }
            const totalAbove350 = new Big(
              row.getValue("offered_total_price") as number
            ).minus(new Big(350).mul(row.getValue("volume")));
            return sum.plus(
              new Big(LICITATOR_350_PERCENTAGE).mul(totalAbove350)
            );
          }, new Big(0))
          .round(2),
      };
    }, [rows]);

  const sellerIncomeGross = useMemo(
    () => totalPrice.minus(costsAbove350).minus(costsBelow350).round(2),
    [totalPrice, costsBelow350, costsAbove350]
  );

  const transportCosts = useMemo(
    () =>
      (seller.used_transport
        ? totalVolume.mul(seller.transport_costs || 0)
        : new Big(0)
      ).round(2),
    [totalVolume, seller]
  );

  const transportVAT = useMemo(
    () =>
      (seller.used_transport ? transportCosts.mul(0.22) : new Big(0)).round(2),
    [transportCosts, seller]
  );

  const loggingCosts = useMemo(
    () =>
      (seller.used_logging || seller.used_logging_non_woods
        ? totalVolume.mul(seller.logging_costs || 0)
        : new Big(0)
      ).round(2),
    [totalVolume, seller]
  );

  const loggingCostsVAT = useMemo(
    () => (seller.used_logging ? loggingCosts.mul(0.095) : new Big(0)).round(2),
    [loggingCosts, seller]
  );

  const loggingCostsNonWoodsVAT = useMemo(
    () =>
      (seller.used_logging_non_woods
        ? loggingCosts.mul(0.22)
        : new Big(0)
      ).round(2),
    [loggingCosts, seller]
  );

  const { sellerIncomeTaxFlat, sellerIncomeTaxVat } = useMemo(
    () => ({
      sellerIncomeTaxFlat: (seller.is_flat_rate &&
      sellerIncomeGross > new Big(0)
        ? sellerIncomeGross.mul(0.08)
        : new Big(0)
      ).round(2),
      sellerIncomeTaxVat: (seller.is_vat_liable &&
      sellerIncomeGross > new Big(0)
        ? sellerIncomeGross.mul(0.22)
        : new Big(0)
      ).round(2),
    }),
    [sellerIncomeGross, seller]
  );

  const sellerIncomeGrossAfterTax = useMemo(() => {
    return sellerIncomeGross
      .plus(sellerIncomeTaxFlat)
      .plus(sellerIncomeTaxVat)
      .round(2);
  }, [sellerIncomeGross, sellerIncomeTaxVat, sellerIncomeTaxFlat]);

  const payout = useMemo(() => {
    return sellerIncomeGrossAfterTax
      .minus(transportCosts)
      .minus(transportVAT)
      .minus(loggingCosts)
      .minus(loggingCostsVAT)
      .minus(loggingCostsNonWoodsVAT)
      .round(2);
  }, [
    sellerIncomeGrossAfterTax,
    transportCosts,
    transportVAT,
    loggingCosts,
    loggingCostsVAT,
    loggingCostsNonWoodsVAT,
  ]);

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

  const rows_summary: { label: string; value: string; bold?: boolean }[] =
    useMemo(
      () =>
        compact([
          { label: t("totalVolume"), value: `${totalVolume.toFixed(2)} m3` },
          { label: t("totalGross"), value: `${totalPrice.toFixed(2)} EUR` },
          {
            label: t("costsTo350"),
            value: `${costsBelow350.toFixed(2)} EUR`,
          },
          {
            label: t("costsAbove350"),
            value: `${costsAbove350.toFixed(2)} EUR`,
          },
          {
            label: t("sellerIncome"),
            value: `${sellerIncomeGross.toFixed(2)} EUR`,
          },
          seller.is_flat_rate > 0 && {
            label: t("flatRate"),
            value: `${sellerIncomeTaxFlat.toFixed(2)} EUR`,
          },
          seller.is_vat_liable > 0 && {
            label: t("vat"),
            value: `${sellerIncomeTaxVat.toFixed(2)} EUR`,
          },
          {
            label: t("sellerIncomeGross"),
            value: `${sellerIncomeGrossAfterTax.toFixed(2)} EUR`,
            bold: true,
          },
          seller.used_transport > 0 && {
            label: `${t("transportCosts")} (${(seller.transport_costs || 0).toFixed(2)} EUR / m3)`,
            value: `${transportCosts.toFixed(2)} EUR`,
          },
          seller.used_transport > 0 && {
            label: t("transportVAT"),
            value: `${transportVAT.toFixed(2)} EUR`,
          },
          (seller.used_logging > 0 || seller.used_logging_non_woods) && {
            label: `${t("loggingCosts")} (${(seller.logging_costs || 0).toFixed(2)} EUR / m3)`,
            value: `${loggingCosts.toFixed(2)} EUR`,
          },
          seller.used_logging > 0 && {
            label: t("loggingCostsVAT"),
            value: `${loggingCostsVAT.toFixed(2)} EUR`,
          },
          seller.used_logging_non_woods > 0 && {
            label: t("loggingCostsNonWoodsVAT"),
            value: `${loggingCostsNonWoodsVAT.toFixed(2)} EUR`,
          },
          { label: t("payout"), value: `${payout.toFixed(2)} EUR`, bold: true },
        ]),
      [
        i18n.language,
        totalVolume,
        totalPrice,
        costsBelow350,
        costsAbove350,
        sellerIncomeGross,
        sellerIncomeTaxFlat,
        sellerIncomeTaxVat,
        sellerIncomeGrossAfterTax,
        transportCosts,
        transportVAT,
        loggingCosts,
        loggingCostsVAT,
        loggingCostsNonWoodsVAT,
        payout,
        seller,
      ]
    );

  const exportToFile = async () => {
    const path = await save({
      filters: [
        {
          name: "Sold pieces Filter",
          extensions: ["pdf"],
        },
      ],
      defaultPath: t("soldPiecesPDFName"),
    });
    if (path) {
      await saveToPDF(
        path,
        {
          woodPiecesData: combinedRows,
          rowsSummary: rows_summary,
          colsSummary: columns_summary,
          seller: seller,
        },
        PdfTypeEnum.soldPieces,
        i18n.language
      );

      await openPath(path);
    }
  };

  return (
    <div className="p-3 h-[calc(100vh-268px)] overflow-auto">
      <button
        className="bg-blue-400 rounded p-2 uppercase text-white font-black disabled:opacity-50 h-10"
        onClick={exportToFile}
      >
        {t("exportInvoice")}
      </button>
      <CustomTable
        table={table}
        trClassName="border-b"
        trhClassName="border-b"
      />
      <table className="mt-5">
        {rows_summary.map((row, index) => {
          return (
            <tr className="border-b" key={index}>
              {columns_summary.map((col) => (
                <td className={`px-2 py-2 ${row.bold ? "font-bold" : ""}`}>
                  {(row as any)[col.accessorKey]}
                </td>
              ))}
            </tr>
          );
        })}
      </table>
    </div>
  );
}
