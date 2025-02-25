import { queryOptions, useMutation } from "@tanstack/react-query";
import { info } from "@tauri-apps/plugin-log";
import { queryClient } from "../main";
import { getDatabase, getDatabaseForModify } from "./database";

type PickAsRequired<TValue, TKey extends keyof TValue> = Omit<TValue, TKey> &
  Required<Pick<TValue, TKey>>;

export type Settings = {
  id: number;
  licitator_fixed_cost: number;
  licitator_percentage: number;
  bundle_cost: number;
};

interface ListOptions {
  language?: "en" | "sl";
}

// @ts-ignore
export const ensureSettings = async (opts: ListOptions): Promise<Settings> => {
  const db = await getDatabase();
  const params: string[] = [];
  const sql = `
    SELECT 
      *
    FROM "settings" 
  `;
  const result = await db.select(sql, params);

  const settings = result as Settings[];
  return settings[0];
};

export async function patchSettings(
  settings: PickAsRequired<Partial<Settings>, "id">
) {
  const db = await getDatabaseForModify();
  await db.execute(
    `UPDATE "settings" 
      SET 
        "bundle_cost" = COALESCE($1, "bundle_cost"), 
        "licitator_fixed_cost" = COALESCE($2, "licitator_fixed_cost"), 
        "licitator_percentage" = COALESCE($3, "licitator_percentage")`,
    [
      settings.bundle_cost,
      settings.licitator_fixed_cost,
      settings.licitator_percentage,
    ]
  );
}

export const useUpdateSettingsMutation = (opts?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  return useMutation({
    mutationFn: patchSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          ["settings", "statistics"].includes(query.queryKey[0] as string),
      });
      if (opts?.onSuccess) opts.onSuccess();
    },
    gcTime: 1000 * 10,
    onError: (e) => {
      info(JSON.stringify(e));
      if (opts?.onError) opts.onError(e);
    },
  });
};

export const settingsQueryOptions = (opts: ListOptions) =>
  queryOptions({
    queryKey: ["settings", opts],
    queryFn: () => ensureSettings(opts),
    staleTime: Infinity,
  });
