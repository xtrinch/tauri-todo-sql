import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Big from "big.js";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CustomTable } from "../../../components/CustomTable";
import { DropdownCellReadonly } from "../../../components/DropdownCellReadonly";
import { TableCellReadonly } from "../../../components/TableCellReadonly";
import { sellerQueryOptions } from "../../../utils/sellerService";
import { treeSpeciesQueryOptions } from "../../../utils/treeSpeciesService";
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
      relations: [],
      language: i18n.language as "sl" | "en",
    })
  );
  const woodPieces = woodPiecesQuery.data;

  const treeSpeciesQuery = useSuspenseQuery(
    treeSpeciesQueryOptions({ language: i18n.language as "en" | "sl" })
  );
  const treeSpeciesData = treeSpeciesQuery.data;

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
            choices: treeSpeciesData.map((ts) => ({
              value: ts.id,
              label: ts.tree_species_name,
            })),
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
        // footer: (info) => <SumFooter info={info} measure="m3" />,
      },
      {
        accessorKey: "offered_price",
        header: () => t("maxPriceM3"),
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
        // footer: (info) => <SumFooter info={info} measure="EUR" />,
      },
      {
        accessorKey: "buyer_name",
        header: () => t("buyer"),
        size: 80,
        meta: {
          readonly: true,
        },
        cell: TableCellReadonly,
      },
    ],
    [treeSpeciesData]
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
            (sum, row) =>
              sum.plus(
                (row.getValue("offered_price") as number) <= 350
                  ? 22 * (row.getValue("volume") as number)
                  : 0
              ),
            new Big(0)
          )
          .round(2),
        costsAbove350: rows
          .reduce(
            (sum, row) =>
              sum.plus(
                (row.getValue("offered_price") as number) > 350
                  ? 0.05 * (row.getValue("offered_total_price") as number)
                  : 0
              ),
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
      .minus(sellerIncomeTaxFlat)
      .minus(sellerIncomeTaxVat)
      .round(2);
  }, [sellerIncomeGross, sellerIncomeTaxVat, sellerIncomeTaxFlat]);

  const payout = useMemo(() => {
    return sellerIncomeGrossAfterTax
      .minus(transportCosts)
      .minus(transportVAT)
      .round(2);
  }, [sellerIncomeGrossAfterTax, transportCosts, transportVAT]);

  return (
    <div className="p-3">
      <CustomTable
        table={table}
        trClassName="border-b"
        trhClassName="border-b"
      />
      <table className="mt-5">
        <tr className="border-b">
          <td className="px-2">{t("totalVolume")}</td>
          <td className="px-2">{totalVolume.toString()} m3</td>
        </tr>
        <tr className="border-b">
          <td className="px-2">{t("totalGross")}</td>
          <td className="px-2">{totalPrice.toString()} EUR</td>
        </tr>
        <tr className="border-b">
          <td className="px-2">{t("costsTo350")}</td>
          <td className="px-2">{costsBelow350.toString()} EUR</td>
        </tr>
        <tr className="border-b">
          <td className="px-2">{t("costsAbove350")}</td>
          <td className="px-2">{costsAbove350.toString()} EUR</td>
        </tr>
        <tr className="border-b">
          <td className="px-2">{t("sellerIncome")}</td>
          <td className="px-2">{sellerIncomeGross.toString()} EUR</td>
        </tr>
        {seller.is_flat_rate > 0 && (
          <tr className="border-b">
            <td className="px-2">{t("flatRate")}</td>
            <td className="px-2">{sellerIncomeTaxFlat.toString()} EUR</td>
          </tr>
        )}
        {seller.is_vat_liable > 0 && (
          <tr className="border-b">
            <td className="px-2">{t("vat")}</td>
            <td className="px-2">{sellerIncomeTaxVat.toString()} EUR</td>
          </tr>
        )}
        <tr className="border-b">
          <td className="px-2 font-bold">{t("sellerIncomeGross")}</td>
          <td className="px-2">{sellerIncomeGrossAfterTax.toString()} EUR</td>
        </tr>
        {seller.used_transport > 0 && (
          <>
            <tr className="border-b">
              <td className="px-2">{t("transportCosts")}</td>
              <td className="px-2">{transportCosts.toString()} EUR</td>
            </tr>
            <tr className="border-b">
              <td className="px-2">{t("transportVAT")}</td>
              <td className="px-2">{transportVAT.toString()} EUR</td>
            </tr>
          </>
        )}
        <tr className="border-b">
          <td className="px-2 font-bold">{t("payout")}</td>
          <td className="px-2">{payout.toString()} EUR</td>
        </tr>
      </table>
    </div>
  );
}
