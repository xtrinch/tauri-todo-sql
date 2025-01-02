import { useSuspenseQuery, type QueryClient } from "@tanstack/react-query";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  Link,
  Outlet,
  createRootRouteWithContext,
  useRouterState,
} from "@tanstack/react-router";
// import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { invoke } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";
import { info } from "@tauri-apps/plugin-log";
import { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { FaArrowRotateLeft, FaRegFloppyDisk } from "react-icons/fa6";
import { Spinner } from "../components/Spinner";
import { queryClient } from "../main";
import type { Auth } from "../utils/auth";
import { buyersQueryOptions } from "../utils/buyerService";
import { unsetDatabase } from "../utils/database";
import { sellersQueryOptions } from "../utils/sellerService";
import { treeSpeciesQueryOptions } from "../utils/treeSpeciesService";
import { useUndo } from "../utils/undo";
import { woodPiecesCountQueryOptions } from "../utils/woodPieceService";

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
    localStorage.getItem("unsaved_changes") === "true"
  );
  const [filePath, setFilePath] = useState<string | null>(
    localStorage.getItem("save_file_path")
  );

  const { mutate: undo } = useUndo(() => {
    queryClient.invalidateQueries();
  });

  const woodPiecesQuery = useSuspenseQuery(woodPiecesCountQueryOptions());
  const woodPiecesCount = woodPiecesQuery.data;

  const treeSpeciesQuery = useSuspenseQuery(
    treeSpeciesQueryOptions({ language: i18n.language as "en" | "sl" })
  );
  const treeSpeciesData = treeSpeciesQuery.data;

  const sellersQuery = useSuspenseQuery(sellersQueryOptions({}));
  const sellers = sellersQuery.data;

  const buyersQuery = useSuspenseQuery(buyersQueryOptions({}));
  const buyers = buyersQuery.data;

  const saveOnly = async (path?: string) => {
    await savePath(path || filePath!);
    localStorage.setItem("unsaved_changes", "false");
    window.dispatchEvent(new Event("storage"));
    toast.success(t("saveSuccess"));
  };

  const loadOnly = async (path?: string) => {
    try {
      await invoke("read_json", { filePath: path || filePath });
    } catch (e) {
      info(JSON.stringify(e));
      throw e;
    }
    localStorage.setItem("unsaved_changes", "false");
    window.dispatchEvent(new Event("storage"));
    unsetDatabase();
    await queryClient.invalidateQueries();
  };

  const resetToSaved = () => {
    loadOnly();
  };

  const savePath = async (path: string) => {
    try {
      await invoke("write_json", { filePath: path });
    } catch (e) {
      info(JSON.stringify(e));
      throw e;
    }
    localStorage.setItem("unsaved_changes", "false");
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
    if (filePath) {
      localStorage.setItem("save_file_path", filePath);
    } else {
      localStorage.removeItem("save_file_path");
    }
  }, [filePath]);

  useEffect(() => {
    function checkUserData() {
      const localStorageChanges =
        localStorage.getItem("unsaved_changes") === "true";
      setChanges(localStorageChanges);
    }

    window.addEventListener("storage", checkUserData);

    return () => {
      window.removeEventListener("storage", checkUserData);
    };
  }, []);

  useEffect(() => {
    i18n.changeLanguage("sl");
  }, []);

  return (
    <>
      <div>
        <Toaster position="bottom-right" />
      </div>

      <div className={`min-h-screen flex flex-col`}>
        <div className={`flex items-center justify-between border-b gap-2`}>
          <div className="flex flex-row space-x-3 items-center">
            <h1 className={`text-3xl p-2 w-[130px]`}>{t("title")}</h1>
            <button
              style={{
                backgroundColor: i18n.language === "en" ? "white" : undefined,
                color: i18n.language === "en" ? "rgb(59,130,246)" : undefined,
              }}
              className="bg-blue-400 rounded p-2 uppercase text-white font-black disabled:opacity-50 h-10"
              onClick={() => i18n.changeLanguage("sl")}
            >
              SL
            </button>
            <button
              style={{
                backgroundColor: i18n.language === "sl" ? "white" : undefined,
                color: i18n.language === "sl" ? "rgb(59,130,246)" : undefined,
              }}
              className="bg-blue-400 rounded p-2 uppercase text-white font-black disabled:opacity-50 h-10"
              onClick={() => i18n.changeLanguage("en")}
            >
              EN
            </button>
          </div>
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
                  className="bg-blue-400 rounded p-2 uppercase text-white font-black disabled:opacity-50 h-10 text-2xl"
                  onClick={() => saveOnly()}
                  title={t("save")}
                >
                  <FaRegFloppyDisk />
                </button>
                <button
                  className="bg-blue-400 rounded p-2 uppercase text-white font-black disabled:opacity-50 h-10"
                  onClick={() => resetToSaved()}
                >
                  {t("resetToSaved")}
                </button>
              </>
            )}
            <button
              className="bg-blue-400 rounded p-2 uppercase text-white font-black disabled:opacity-50 h-10"
              onClick={() => saveAs()}
            >
              {t("saveAs")}
            </button>
            <button
              className="bg-blue-400 rounded p-2 uppercase text-white font-black disabled:opacity-50 h-10"
              onClick={() => loadFile()}
            >
              {t("open")}
            </button>
            <button
              className="bg-blue-400 rounded p-2 uppercase text-white font-black disabled:opacity-50 h-10 text-2xl"
              onClick={() => undo()}
              title={t("undo")}
            >
              <FaArrowRotateLeft />
            </button>
          </div>
        </div>
        <div className={`flex-1 flex`}>
          <div className={`divide-y w-[220px] min-w-[220px]`}>
            {(
              [
                ["/sellers", `${t("sellers")} (${sellers.length})`],
                ["/buyers", `${t("buyers")} (${buyers.length})`],
                ["/inventory", `${t("inventory")} (${woodPiecesCount})`],
                [
                  "/treeSpecies/edit",
                  `${t("treeSpeciesPlural")} (${treeSpeciesData.length})`,
                ],
              ] as const
            ).map(([to, label]) => {
              return (
                <div key={to}>
                  <Link
                    to={to}
                    activeOptions={{}}
                    className={`block py-2 px-3 text-blue-600`}
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
      {/* <ReactQueryDevtools buttonPosition="bottom-left" />
      <TanStackRouterDevtools position="bottom-right" /> */}
    </>
  );
}
