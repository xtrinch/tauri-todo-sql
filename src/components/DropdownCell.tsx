import { Column, Getter, Row, Table } from "@tanstack/react-table";
import "choices.js/public/assets/styles/choices.css";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaAngleDown } from "react-icons/fa6";
import Select, { createFilter, SingleValue } from "react-select";
import { CustomTableMeta } from "./TableCell";

interface Option {
  value: number;
  label: string;
}

// copy some interfaces from react-select since they don't export them
interface Config<Option> {
  readonly ignoreCase?: boolean;
  readonly ignoreAccents?: boolean;
  readonly stringify?: (option: FilterOptionOption<Option>) => string;
  readonly trim?: boolean;
  readonly matchFrom?: "any" | "start";
}
export interface FilterOptionOption<Option> {
  readonly label: string;
  readonly value: string;
  readonly data: Option;
}

const filterConfig: Config<Option> = {
  ignoreCase: true,
  ignoreAccents: true,
  trim: true,
  matchFrom: "any",
  stringify: (option) => `${option.label}`,
};

export const DropdownCell = <TableItem,>({
  getValue,
  row,
  column,
  table,
  choices: choiceData,
  isScrolling,
  shouldBeRed,
}: {
  getValue: Getter<unknown>;
  row: Row<TableItem>;
  column: Column<TableItem>;
  table: Table<TableItem>;
  choices: Option[];
  isScrolling?: boolean;
  shouldBeRed?: (row: Row<TableItem>) => boolean;
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

  const meta = table.options.meta;

  const choiceOptions = useMemo(
    () =>
      (choiceData || []).map((c) => ({
        value: c.value,
        label: c.label,
      })),
    [choiceData]
  );

  const onChange = (newValue: SingleValue<Option>) => {
    setValue({ label: newValue?.label!, value: newValue?.value! });
    if (initialValue !== newValue?.value) {
      (meta as CustomTableMeta)?.onEdit({
        id: (row.original as { id: number }).id,
        [column.id]: newValue?.value,
      });
    }
  };

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
    <div className={`w-full relative`}>
      {isScrolling && false ? (
        <div className="bg-white w-full h-[38px] border rounded-md items-center pl-[10px] flex flex-row">
          <div className="flex-1">
            {value ? (
              <div className="text-[hsl(0,0%,20%)]">{value?.label}</div>
            ) : (
              <div className="text-[rgb(128,128,128)]">{t("select")}</div>
            )}
          </div>
          <div className="w-[37px] h-full py-[8px] flex flex-row">
            <div className="bg-[hsl(0,0%,80%)] h-full w-[1px]" />
            <div className="flex items-center justify-center text-[hsl(0,0%,80%)] w-full">
              <FaAngleDown />
            </div>
          </div>
        </div>
      ) : (
        <Select
          options={choiceOptions}
          isSearchable={true}
          onChange={onChange}
          value={value}
          placeholder={t("select")}
          filterOption={createFilter(filterConfig)}
          styles={{
            // ...styles,
            control: (base) => ({
              ...base,
              "&:hover": { borderWidth: 1 }, // border style on hover
              boxShadow: "none", // no box-shadow
              ...(shouldBeRed?.(row) && {
                backgroundColor: "rgb(248,113,113)",
              }),
            }),
          }}
        />
      )}
    </div>
  );
};
