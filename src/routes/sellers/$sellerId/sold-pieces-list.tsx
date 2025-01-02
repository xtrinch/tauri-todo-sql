import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { save } from "@tauri-apps/plugin-dialog";
import Big from "big.js";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CustomTable } from "../../../components/CustomTable";
import { SoldPiecesExport } from "../../../components/SoldPiecesExport";
import { TableCellReadonly } from "../../../components/TableCellReadonly";
import { saveToPDF } from "../../../utils/pdf";
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
      offered_price__isnotnull: true,
      min_price_used: true,
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
        accessorKey: "tree_species_name",
        header: () => t("treeSpecies"),
        size: 200,
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
        size: 80,
        meta: {
          readonly: true,
        },
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
              sum.plus(row.getValue("offered_total_price") as number),
            new Big(0)
          )
          .round(2),
        costsBelow350: rows
          .reduce(
            (sum, row) => sum.plus(22 * (row.getValue("volume") as number)),
            new Big(0)
          )
          .round(2),
        costsAbove350: rows
          .reduce(
            (sum, row) =>
              sum.plus(0.05 * (row.getValue("offered_total_price") as number)),
            new Big(0)
          )
          .round(2),
      };
    }, [rows]);

  const sellerIncomeGross = useMemo(
    () => totalPrice.minus(costsAbove350).minus(costsBelow350).round(2),
    [totalPrice, costsBelow350, costsAbove350]
  );

  const transportCosts = useMemo(
    () => (seller.used_transport ? totalVolume.mul(18) : new Big(0)).round(2),
    [totalVolume, seller]
  );

  const transportVAT = useMemo(
    () =>
      (seller.used_transport ? transportCosts.mul(0.22) : new Big(0)).round(2),
    [transportCosts, seller]
  );

  const loggingCosts = useMemo(
    () => (seller.used_logging ? totalVolume.mul(18) : new Big(0)).round(2),
    [totalVolume, seller]
  );

  const loggingCostsVAT = useMemo(
    () => (seller.used_logging ? loggingCosts.mul(0.095) : new Big(0)).round(2),
    [loggingCosts, seller]
  );

  const { sellerIncomeTaxFlat, sellerIncomeTaxVat } = useMemo(
    () => ({
      sellerIncomeTaxFlat: (seller.is_flat_rate
        ? sellerIncomeGross.mul(0.08)
        : new Big(0)
      ).round(2),
      sellerIncomeTaxVat: (seller.is_vat_liable
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
      .round(2);
  }, [
    sellerIncomeGrossAfterTax,
    transportCosts,
    transportVAT,
    loggingCosts,
    loggingCostsVAT,
  ]);

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
      saveToPDF(path, <SoldPiecesExport woodPiecesData={woodPieces} />);
    }
  };

  return (
    <div className="p-3">
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
      <table className="mt-5">
        <tr className="border-b">
          <td className="px-2 py-2">{t("totalVolume")}</td>
          <td className="px-2 py-2">{totalVolume.toFixed(2)} m3</td>
        </tr>
        <tr className="border-b">
          <td className="px-2 py-2">{t("totalGross")}</td>
          <td className="px-2 py-2">{totalPrice.toFixed(2)} EUR</td>
        </tr>
        <tr className="border-b">
          <td className="px-2 py-2">{t("costsTo350")}</td>
          <td className="px-2 py-2">{costsBelow350.toFixed(2)} EUR</td>
        </tr>
        <tr className="border-b">
          <td className="px-2 py-2">{t("costsAbove350")}</td>
          <td className="px-2 py-2">{costsAbove350.toFixed(2)} EUR</td>
        </tr>
        <tr className="border-b">
          <td className="px-2 py-2">{t("sellerIncome")}</td>
          <td className="px-2 py-2">{sellerIncomeGross.toFixed(2)} EUR</td>
        </tr>
        {seller.is_flat_rate > 0 && (
          <tr className="border-b">
            <td className="px-2 py-2">{t("flatRate")}</td>
            <td className="px-2 py-2">{sellerIncomeTaxFlat.toFixed(2)} EUR</td>
          </tr>
        )}
        {seller.is_vat_liable > 0 && (
          <tr className="border-b">
            <td className="px-2 py-2">{t("vat")}</td>
            <td className="px-2 py-2">{sellerIncomeTaxVat.toFixed(2)} EUR</td>
          </tr>
        )}
        <tr className="border-b">
          <td className="px-2 py-2 font-bold">{t("sellerIncomeGross")}</td>
          <td className="px-2 py-2">
            {sellerIncomeGrossAfterTax.toFixed(2)} EUR
          </td>
        </tr>
        {seller.used_transport > 0 && (
          <>
            <tr className="border-b">
              <td className="px-2 py-2">{t("transportCosts")}</td>
              <td className="px-2 py-2">{transportCosts.toFixed(2)} EUR</td>
            </tr>
            <tr className="border-b">
              <td className="px-2 py-2">{t("transportVAT")}</td>
              <td className="px-2 py-2">{transportVAT.toFixed(2)} EUR</td>
            </tr>
          </>
        )}
        {seller.used_logging > 0 && (
          <>
            <tr className="border-b">
              <td className="px-2 py-2">{t("loggingCosts")}</td>
              <td className="px-2 py-2">{loggingCosts.toFixed(2)} EUR</td>
            </tr>
            <tr className="border-b">
              <td className="px-2 py-2">{t("loggingCostsVAT")}</td>
              <td className="px-2 py-2">{loggingCostsVAT.toFixed(2)} EUR</td>
            </tr>
          </>
        )}
        <tr className="border-b">
          <td className="px-2 py-2 font-bold">{t("payout")}</td>
          <td className="px-2 py-2">{payout.toFixed(2)} EUR</td>
        </tr>
      </table>
    </div>
  );
}
