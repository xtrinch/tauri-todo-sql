import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  Link,
  Outlet,
  createRootRouteWithContext,
  useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { invoke } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";
import { info } from "@tauri-apps/plugin-log";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Spinner } from "../components/Spinner";
import { queryClient } from "../main";
import type { Auth } from "../utils/auth";
import { useUndo } from "../utils/undo";

function RouterSpinner() {
  const isLoading = useRouterState({ select: (s) => s.status === "pending" });
  return <Spinner show={isLoading} />;
}

export const Route = createRootRouteWithContext<{
  auth: Auth;
  queryClient: QueryClient;
}>()({
  component: RootComponent,
});

function RootComponent() {
  const { t, i18n } = useTranslation();

  const [changes, setChanges] = useState<boolean | null>(
    localStorage.getItem("changes") === "true"
  );
  const [filePath, setFilePath] = useState<string | null>(
    localStorage.getItem("file_path")
  );

  const { mutate: undo } = useUndo(() => {
    queryClient.invalidateQueries();
  });

  const saveOnly = async (path?: string) => {
    await savePath(path || filePath!);
    localStorage.setItem("changes", "false");
    window.dispatchEvent(new Event("storage"));
  };

  const loadOnly = async (path?: string) => {
    await invoke("load_sqlite_db", { filePath: path || filePath });
    localStorage.setItem("changes", "false");
    window.dispatchEvent(new Event("storage"));
    await queryClient.invalidateQueries();
  };

  const resetToSaved = () => {
    loadOnly();
  };

  const savePath = async (path: string) => {
    await invoke("dump_sqlite_db", { filePath: path });
    localStorage.setItem("changes", "false");
  };

  const saveAs = async () => {
    const path = await save({
      filters: [
        {
          name: "My Filter",
          extensions: ["dump"],
        },
      ],
      defaultPath: "db",
    });

    if (path) {
      saveOnly(path);
      setFilePath(path);
    }
  };

  const loadFile = async () => {
    const path = await open({
      multiple: false,
      directory: false,
      filters: [{ name: "My Filter", extensions: ["dump"] }],
    });

    if (path) {
      setFilePath(path);
      await loadOnly(path);
    }
  };

  useEffect(() => {
    localStorage.setItem("file_path", filePath || undefined!);
  }, [filePath]);

  useEffect(() => {
    function checkUserData() {
      info("CHANGED");
      const localStorageChanges = localStorage.getItem("changes") === "true";
      setChanges(localStorageChanges);
    }

    window.addEventListener("storage", checkUserData);

    return () => {
      window.removeEventListener("storage", checkUserData);
    };
  }, []);

  return (
    <>
      <div className={`min-h-screen flex flex-col`}>
        <div className={`flex items-center justify-between border-b gap-2`}>
          <h1 className={`text-3xl p-2`}>{t("title")}</h1>

          {/* Show a global spinner when the router is transitioning */}
          <div className="flex flex-row pr-2 space-x-2 items-center">
            <div className={`text-3xl`}>
              <RouterSpinner />
            </div>
            <div className="text-sm flex flex-col items-end">
              <div>{filePath || ""}</div>
              {changes && <div>{t("unsavedChanges")}</div>}
            </div>
            {filePath && (
              <>
                <button
                  className="bg-blue-500 rounded p-2 uppercase text-white font-black disabled:opacity-50 h-10"
                  onClick={() => saveOnly()}
                >
                  Save
                </button>
                <button
                  className="bg-blue-500 rounded p-2 uppercase text-white font-black disabled:opacity-50 h-10"
                  onClick={() => resetToSaved()}
                >
                  Reset to saved
                </button>
              </>
            )}
            <button
              className="bg-blue-500 rounded p-2 uppercase text-white font-black disabled:opacity-50 h-10"
              onClick={() => saveAs()}
            >
              Save as
            </button>
            <button
              className="bg-blue-500 rounded p-2 uppercase text-white font-black disabled:opacity-50 h-10"
              onClick={() => loadFile()}
            >
              Open
            </button>
            <button
              className="bg-blue-500 rounded p-2 uppercase text-white font-black disabled:opacity-50 h-10"
              onClick={() => undo()}
            >
              Undo
            </button>
          </div>
        </div>
        <div className={`flex-1 flex`}>
          <div className={`divide-y w-36 min-w-36`}>
            {(
              [
                ["/sellers", "Sellers"],
                ["/buyers", "Buyers"],
                ["/inventory", "Inventory"],
              ] as const
            ).map(([to, label]) => {
              return (
                <div key={to}>
                  <Link
                    to={to}
                    activeOptions={{}}
                    className={`block py-2 px-3 text-blue-700`}
                    // Make "active" links bold
                    activeProps={{ className: `font-bold bg-gray-100` }}
                  >
                    {label}
                  </Link>
                </div>
              );
            })}
          </div>
          <div className={`flex-1 border-l`}>
            <Outlet />
          </div>
        </div>
      </div>
      <ReactQueryDevtools buttonPosition="bottom-left" />
      <TanStackRouterDevtools position="bottom-right" />
    </>
  );
}
