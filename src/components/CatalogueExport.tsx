import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { WoodPiece } from "../utils/woodPieceService";
import { PdfTable } from "./PdfTable";

export const CatalogueExport = (params: { woodPiecesData: WoodPiece[] }) => {
  const { t } = useTranslation();

  const columns = useMemo<
    {
      accessorKey: string;
      header: () => string;
      size: number;
      meta?: { type?: string };
    }[]
  >(
    () => [
      {
        accessorKey: "sequence_no",
        header: () => t("seqNo"),
        size: 10,
      },
      {
        accessorKey: "plate_no",
        header: () => t("plateNo"),
        size: 15,
      },
      {
        accessorKey: "tree_species_name",
        header: () => t("treeSpecies"),
        size: 30,
      },
      {
        accessorKey: "width",
        header: () => t("widthCm"),
        size: 15,
        meta: {
          type: "float",
        },
      },
      {
        accessorKey: "length",
        header: () => t("lengthM"),
        size: 15,
        meta: {
          type: "float",
        },
      },
      {
        accessorKey: "volume",
        header: () => t("volumeM3"),
        size: 15,
        meta: {
          type: "float",
        },
      },
      {
        accessorKey: "ident",
        header: () => t("sellerIdent"),
        size: 15,
      },
    ],
    []
  );

  return <PdfTable data={params.woodPiecesData} columns={columns} />;
};
