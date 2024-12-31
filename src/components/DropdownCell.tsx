import { Column, Getter, Row, Table } from "@tanstack/react-table";
import "choices.js/public/assets/styles/choices.css";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Select from "react-select";
import { CustomTableMeta } from "./TableCell";

interface Option {
  value: number;
  label: string;
}
export const DropdownCell = <TableItem,>({
  getValue,
  row,
  column,
  table,
  choices: choiceData,
}: {
  getValue: Getter<unknown>;
  row: Row<TableItem>;
  column: Column<TableItem>;
  table: Table<TableItem>;
  choices: Option[];
}) => {
  const initialValue: number = getValue() as number;
  const { t } = useTranslation();

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
  const [valueOnFocus, setValueOnFocus] = useState<Option | null>(
    initialValue
      ? {
          value: initialValue,
          label: labelForValue(initialValue),
        }
      : null
  );

  const meta = table.options.meta;

  const onFocus = () => {
    setValueOnFocus(value);
  };

  // When the input is blurred, we'll call our table meta's updateData function
  const onBlur = () => {
    const data = {
      id: (row.original as { id: number }).id,
      [column.id]: value?.value,
    };
    // only call on edit if there's changes
    if (value !== valueOnFocus) {
      (meta as CustomTableMeta)?.onEdit(data);
    }
  };

  const choiceOptions = (choiceData || []).map((c) => ({
    value: c.value,
    label: `${c.label || "No label"}`,
  }));

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

  return (
    <div className="w-full">
      <Select
        options={choiceOptions}
        isSearchable={true}
        onChange={(newValue) =>
          setValue({ label: newValue?.label!, value: newValue?.value! })
        }
        onBlur={onBlur}
        value={value}
        onFocus={onFocus}
        placeholder={t("select")}
      />
    </div>
  );
};
