import { StyleSheet, Text, View } from "@react-pdf/renderer";
import Big from "big.js";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

const styles = StyleSheet.create({
  label: { fontSize: 11, fontWeight: "bold" },
  value: { fontSize: 11 },
});

export const PDFSumFooter = (params: {
  label?: string;
  data: any[];
  column: string;
  measure?: string;
}) => {
  const { t } = useTranslation();

  const rows = params.data;
  const total = useMemo(
    () =>
      rows
        .reduce(
          (sum, row) => sum.plus(row[params.column] as number),
          new Big(0)
        )
        .round(2),
    [rows]
  );

  return (
    <View>
      <View style={styles.label}>
        <Text>{params.label || t("total")}:</Text>
      </View>
      <View>
        <Text style={styles.value}>
          {total.toFixed(2)} {params.measure}
        </Text>
      </View>
    </View>
  );
};
