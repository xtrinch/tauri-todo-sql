import {
  Column,
  ColumnMeta,
  Getter,
  Row,
  Table,
  TableMeta,
} from "@tanstack/react-table";
import { info } from "@tauri-apps/plugin-log";
import { debounce } from "lodash";
import { useCallback, useEffect, useRef, useState } from "react";

export interface CustomColumnMeta extends ColumnMeta<{}, undefined> {
  type?: string;
  readonly?: boolean;
}
export interface CustomTableMeta extends TableMeta<{}> {
  onAdd?: () => void;
  onRemove?: (id: number) => void;
  onEdit: (data: Partial<{}>) => void;
}

export const TableCell = <TableItem,>({
  getValue,
  row,
  column,
  table,
}: {
  getValue: Getter<unknown>;
  row: Row<TableItem>;
  column: Column<TableItem>;
  table: Table<TableItem>;
}) => {
  const initialValue = getValue();
  const rowId = (row.original as { id: number }).id;
  const columnMeta = column.columnDef.meta as CustomColumnMeta;
  const isReadonly = columnMeta?.readonly;
  const input = useRef(null);

  const getFormattedVal = (val: any) => {
    if (columnMeta?.type === "float") {
      val = parseFloat(val as string).toFixed(2);
      if (isNaN(val as number)) {
        val = (0).toFixed(2);
      }
    }
    if (columnMeta?.type === "integer") {
      val = parseInt(val as string);
      if (isNaN(val as number)) {
        val = 0;
      }
    }

    return val;
  };

  // We need to keep and update the state of the cell normally
  const [value, setValue] = useState<string>(getFormattedVal(initialValue));
  const [valueOnFocus, setValueOnFocus] = useState(
    getFormattedVal(initialValue)
  );

  // When the input is blurred, we'll call our table meta's updateData function
  const save = (newVal: string) => {
    debouncedSave.cancel();

    if (isReadonly) {
      return;
    }

    const val = getFormattedVal(newVal);
    // only call on edit if there's changes
    if (newVal !== valueOnFocus) {
      info(`ID::::::::::::${rowId}`);
      (meta as CustomTableMeta)?.onEdit({
        id: rowId,
        [column.id]: val,
      });
    }
    setValue(newVal);
  };

  const debouncedSave = useCallback(debounce(save, 1000), [rowId]);

  const meta = table.options.meta;

  const onFocus = () => {
    setValueOnFocus(value);
  };

  const onBlur = () => {
    debouncedSave.cancel();

    if (isReadonly) {
      return;
    }

    const val = getFormattedVal(value);
    // only call on edit if there's changes
    if (value !== valueOnFocus) {
      info(`IDBLUR::::::::::::${rowId}`);

      (meta as CustomTableMeta)?.onEdit({
        id: rowId,
        [column.id]: val,
      });
    }
    setValue(val);
  };

  const onChange = (e: any) => {
    setValue(e.target.value);
    debouncedSave.cancel();
    debouncedSave(e.target.value);
  };

  // If the initialValue is changed external, sync it up with our state
  useEffect(() => {
    const newVal = getFormattedVal(initialValue || "");
    if (newVal !== value && document.activeElement !== input.current) {
      setValue(getFormattedVal(initialValue || ""));
    }
  }, [initialValue, rowId]);

  return (
    <>
      <input
        ref={input}
        value={value as string}
        className="bg-green h-10 min-w-[100%] max-w-[100%] border p-1 px-2 rounded"
        onChange={onChange}
        onBlur={onBlur}
        // save={() => setValue(getFormattedVal(value))}
        readOnly={columnMeta?.readonly}
        tabIndex={columnMeta?.readonly ? -1 : undefined}
        onFocus={onFocus}
        spellCheck={false}
      />
    </>
  );
};
