import { Column, Getter, Row, Table } from "@tanstack/react-table";
import { info } from "@tauri-apps/plugin-log";
import "choices.js/public/assets/styles/choices.css";
import { useEffect, useState } from "react";
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
  info("INTIIAL VALLLL");
  info(`${initialValue}`);

  const labelForValue = (val: number): string => {
    return choiceData.find((i) => i.value === val)?.label || "";
  };

  // We need to keep and update the state of the cell normally
  const [value, setValue] = useState<Option>(
    initialValue
      ? {
          value: initialValue,
          label: labelForValue(initialValue),
        }
      : undefined
  );
  const [valueOnFocus, setValueOnFocus] = useState<Option>(
    initialValue
      ? {
          value: initialValue,
          label: labelForValue(initialValue),
        }
      : undefined
  );

  const meta = table.options.meta;

  const onFocus = () => {
    info("ON FOCUS");
    setValueOnFocus(value);
  };

  // When the input is blurred, we'll call our table meta's updateData function
  const onBlur = () => {
    info("ON BLUR");
    info(`${value}${valueOnFocus}`);

    info("ON BLUR ROW:");
    info(JSON.stringify(row.original));
    const data = {
      id: (row.original as { id: number }).id,
      [column.id]: value.value,
    };
    info(JSON.stringify(data));
    // only call on edit if there's changes
    if (value !== valueOnFocus) {
      (meta as CustomTableMeta)?.onEdit(data);
    }
  };

  const choiceOptions = (choiceData || []).map((c) => ({
    value: c.value,
    label: `${c.label}`,
  }));

  // If the initialValue is changed external, sync it up with our state
  useEffect(() => {
    if (initialValue) {
      setValue({
        value: initialValue,
        label: labelForValue(initialValue),
      });
    } else {
      info("CLEARING VALUE");
      setValue(null);
    }
  }, [initialValue]);

  return (
    <div className="min-w-[200px] bg-green" style={{ minWidth: "200px" }}>
      <Select
        options={choiceOptions}
        isSearchable={true}
        onChange={(newValue) =>
          setValue({ label: newValue?.label!, value: newValue?.value! })
        }
        onBlur={onBlur}
        value={value}
        onFocus={onFocus}
      />
    </div>
  );
};
