import { Column, Getter, Row, Table } from "@tanstack/react-table";
import "choices.js/public/assets/styles/choices.css";
import { useEffect, useState } from "react";

interface Option {
  value: number;
  label: string;
}
export const DropdownCellReadonly = <TableItem,>({
  getValue,
  choices: choiceData,
}: {
  getValue: Getter<unknown>;
  row: Row<TableItem>;
  column: Column<TableItem>;
  table: Table<TableItem>;
  choices: Option[];
}) => {
  const initialValue: number = getValue() as number;

  const labelForValue = (val: number): string => {
    return choiceData.find((i) => i.value === val)?.label || "";
  };

  // We need to keep and update the state of the cell normally
  const [value, setValue] = useState<Option | null>(
    initialValue
      ? {
          value: initialValue,
          label: labelForValue(initialValue),
        }
      : null
  );

  // If the initialValue is changed external, sync it up with our state
  useEffect(() => {
    if (initialValue) {
      setValue({
        value: initialValue,
        label: labelForValue(initialValue),
      });
    } else {
      setValue(null);
    }
  }, [initialValue]);

  return <div className="w-full bg-green">{value?.label}</div>;
};
