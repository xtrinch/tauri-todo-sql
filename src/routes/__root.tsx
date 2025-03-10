import { useSuspenseQuery, type QueryClient } from "@tanstack/react-query";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  Link,
  Outlet,
  createRootRouteWithContext,
  useNavigate,
} from "@tanstack/react-router";
import { useDetectClickOutside } from "react-detect-click-outside";

// import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { getVersion } from "@tauri-apps/api/app";
import { invoke } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";
import { info } from "@tauri-apps/plugin-log";
import { relaunch } from "@tauri-apps/plugin-process";
import { Update, check } from "@tauri-apps/plugin-updater";
import { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  FaAngleDown,
  FaArrowRotateLeft,
  FaRegFloppyDisk,
} from "react-icons/fa6";
import { queryClient } from "../main";
import { buyersQueryOptions } from "../utils/buyerService";
import { confirm } from "../utils/confirm";
import { unsetDatabase } from "../utils/database";
import { sellersQueryOptions } from "../utils/sellerService";
import { treeSpeciesQueryOptions } from "../utils/treeSpeciesService";
import { useUndo } from "../utils/undo";
import { woodPiecesCountQueryOptions } from "../utils/woodPieceService";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: RootComponent,
});

function RootComponent() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate({ from: Route.fullPath });

  getVersion().then((version) => setAppVersion(version));

  const [appVersion, setAppVersion] = useState<string>("");
  // whether app has unsaved changes
  const [changes, setChanges] = useState<boolean | null>(
    localStorage.getItem("unsaved_changes_v10") === "true"
  );
  const [filePath, setFilePath] = useState<string | null>(
    localStorage.getItem("save_file_path_v10")
  );
  const [fileMenuOpen, setFileMenuOpen] = useState<boolean>(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState<boolean>(false);

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
    localStorage.setItem("unsaved_changes_v10", "false");
    window.dispatchEvent(new Event("storage"));
    toast.success(t("saveSuccess"));
  };

  const loadOnly = async (path?: string) => {
    const toastId = toast.loading(t("loading"), {
      position: "top-center",
    });
    try {
      await invoke("read_json", { filePath: path || filePath });
    } catch (e) {
      let error = e as Error;
      info(JSON.stringify(e));
      toast.dismiss(toastId);
      toast.error(`${t("error")} ${JSON.stringify(error)}`);
      throw e;
    }
    localStorage.setItem("unsaved_changes_v10", "false");
    window.dispatchEvent(new Event("storage"));
    unsetDatabase();
    await queryClient.invalidateQueries();
    toast.dismiss(toastId);
    toast.success(t("success"));
  };

  const resetToSaved = async () => {
    if (await confirm({ confirmation: t("areYouSure") })) {
      loadOnly();
    }
  };

  const resetApplicationData = async () => {
    if (await confirm({ confirmation: t("areYouSure") })) {
      localStorage.removeItem("save_file_path_v10");
      localStorage.setItem("unsaved_changes_v10", "false");
      window.dispatchEvent(new Event("storage"));

      try {
        await invoke("truncate_all_data", {});
      } catch (e) {
        info(JSON.stringify(e));
        throw e;
      }
      await queryClient.invalidateQueries();
      navigate({
        to: "/statistics",
      });
    }
  };

  const savePath = async (path: string) => {
    try {
      await invoke("write_json", { filePath: path });
    } catch (e) {
      info(JSON.stringify(e));
      throw e;
    }
    localStorage.setItem("unsaved_changes_v10", "false");
  };

  const saveAs = async () => {
    const path = await save({
      filters: [
        {
          name: "My Filter",
          extensions: ["bk"],
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
      filters: [{ name: "My Filter", extensions: ["bk"] }],
    });

    if (path) {
      setFilePath(path);
      await loadOnly(path);
    }
  };

  const checkForUpdates = async () => {
    if (changes) {
      const confirmed = await confirm({
        confirmation: t("unsavedChangesFound"),
        title: t("info"),
      });
      if (!confirmed) {
        return;
      }
    }

    const toastId = toast.loading(t("checkingForUpdates"), {
      position: "top-center",
    });
    let update: Update | null = null;
    try {
      update = await check();
    } catch (e) {
      info(JSON.stringify(e));
      toast.dismiss(toastId);
      toast.error(t("error"));
    }
    toast.dismiss(toastId);

    if (!update) {
      await confirm({
        confirmation: t("noUpdatesFound"),
        title: t("info"),
        hideCancel: true,
      });
      return;
    }
    console.log(
      `found update ${update.version} from ${update.date} with notes ${update.body}`
    );

    if (
      await confirm({
        confirmation: `${t("foundUpdate")} ${update.version}. ${t("shouldRelaunch")}`,
        title: t("info"),
      })
    ) {
      let downloaded = 0;
      let contentLength = 0;
      let toastId: string;
      const prepareToastId = toast.loading(t("preparingUpdate"), {
        position: "top-center",
      });
      // alternatively we could also call update.download() and update.install() separately
      await update.downloadAndInstall((event) => {
        try {
          // we do not want this to throw under any circumstance
          toast.dismiss(prepareToastId);
        } catch (e) {}
        switch (event.event) {
          case "Started":
            contentLength = event.data.contentLength!;
            info(`started downloading ${event.data.contentLength} bytes`);
            toastId = toast.loading(t("downloading"), {
              position: "top-center",
            });
            break;
          case "Progress":
            downloaded += event.data.chunkLength;
            info(`downloaded ${downloaded} from ${contentLength}`);
            break;
          case "Finished":
            info("download finished");
            toast.dismiss(toastId);
            break;
        }
      });

      toast.success(t("updateInstalled"));
      try {
        await relaunch();
      } catch (e) {
        toast.error(t("failedToRelaunch"));
        info(JSON.stringify(e));
      }
    }
  };

  const dropdownRefFile = useDetectClickOutside({
    onTriggered: () => {
      if (fileMenuOpen) {
        setFileMenuOpen(false);
      }
    },
  });
  const dropdownRefLanguage = useDetectClickOutside({
    onTriggered: () => {
      if (languageMenuOpen) {
        setLanguageMenuOpen(false);
      }
    },
  });

  useEffect(() => {
    if (filePath) {
      localStorage.setItem("save_file_path_v10", filePath);
    } else {
      localStorage.removeItem("save_file_path_v10");
    }
  }, [filePath]);

  useEffect(() => {
    function checkUserData() {
      const localStorageChanges =
        localStorage.getItem("unsaved_changes_v10") === "true";
      setChanges(localStorageChanges);
      const localStorageFilePath = localStorage.getItem("save_file_path_v10");
      setFilePath(localStorageFilePath);
    }

    window.addEventListener("storage", checkUserData);

    return () => {
      window.removeEventListener("storage", checkUserData);
    };
  }, []);

  useEffect(() => {
    i18n.changeLanguage("sl");
  }, []);

  useEffect(() => {
    function disableContextMenu(e: Event) {
      // do not show any default context menus on right click
      if (window.location.hostname !== "tauri.localhost") {
        return;
      }

      e.preventDefault();
      return false;
    }

    document.addEventListener("contextmenu", disableContextMenu, {
      capture: true,
    });

    return () => {
      window.removeEventListener("contextmenu", disableContextMenu);
    };
  });

  return (
    <>
      <div>
        <Toaster position="bottom-right" />
      </div>

      <div className={`min-h-screen flex flex-col`}>
        <div className={`flex items-center justify-between border-b gap-2`}>
          <div className="flex flex-row space-x-3 items-end p-2">
            <h1 className={`text-3xl`}>{t("title")}</h1>{" "}
            <div>v{appVersion}</div>
          </div>
          {/* Show a global spinner when the router is transitioning */}
          <div className="flex flex-row pr-2 space-x-2 items-center">
            <div className="text-sm flex flex-col items-end">
              <div>{filePath || ""}</div>
              {(changes || !filePath) && <div>{t("unsavedChanges")}</div>}
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
              </>
            )}
            <button
              className="bg-blue-400 rounded p-2 uppercase text-white font-black disabled:opacity-50 h-10 text-2xl"
              onClick={() => undo()}
              title={t("undo")}
            >
              <FaArrowRotateLeft />
            </button>
            <div className="relative inline-block text-left">
              <div className="flex flex-row space-x-2">
                <button
                  type="button"
                  className="bg-blue-400 h-[40px] text-white inline-flex w-full justify-center items-center gap-x-1.5 rounded-md px-3 text-sm font-semibold "
                  id="menu-button"
                  aria-expanded="true"
                  aria-haspopup="true"
                  onMouseEnter={() => setFileMenuOpen(true)}
                >
                  {t("options")}
                  <FaAngleDown />
                </button>
                <button
                  type="button"
                  className="bg-blue-400 h-[40px] text-white inline-flex w-full justify-center items-center gap-x-1.5 rounded-md px-3 text-sm font-semibold "
                  id="menu-button"
                  aria-expanded="true"
                  aria-haspopup="true"
                  onMouseEnter={() => setLanguageMenuOpen(true)}
                >
                  {t("language")}
                  <FaAngleDown />
                </button>
              </div>

              {fileMenuOpen && (
                <div
                  ref={dropdownRefFile}
                  className="absolute right-20 z-10 mt-2 w-60 origin-top-right rounded-md shadow-lg ring-1 ring-black/5 focus:outline-none overflow-hidden"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="menu-button"
                  tabIndex={-1}
                  onMouseLeave={() => setFileMenuOpen(false)}
                >
                  <div role="none">
                    <button
                      className="w-full block p-2 disabled:opacity-50 h-10 text-sm text-gray-700 px-4 text-left bg-white "
                      onClick={() => checkForUpdates()}
                    >
                      {t("checkForUpdates")}
                    </button>
                    {filePath && (
                      <>
                        <button
                          className="w-full block p-2 disabled:opacity-50 h-10 text-sm text-gray-700 px-4 text-left bg-white "
                          onClick={() => saveOnly()}
                          title={t("save")}
                        >
                          {t("save")}
                        </button>
                        <button
                          className="w-full block p-2 disabled:opacity-50 h-10 text-sm text-gray-700 px-4 text-left bg-white "
                          onClick={() => resetToSaved()}
                        >
                          {t("resetToSaved")}
                        </button>
                      </>
                    )}
                    <button
                      className="w-full block p-2 disabled:opacity-50 h-10 text-sm text-gray-700 px-4 text-left bg-white "
                      onClick={() => saveAs()}
                    >
                      {t("saveAs")}
                    </button>
                    <button
                      className="w-full block p-2 disabled:opacity-50 h-10 text-sm text-gray-700 px-4 text-left bg-white "
                      onClick={() => loadFile()}
                    >
                      {t("open")}
                    </button>
                    <button
                      className="w-full block p-2 disabled:opacity-50 h-10 text-sm text-gray-700 px-4 text-left bg-white "
                      onClick={() => resetApplicationData()}
                    >
                      {t("resetApplicationData")}
                    </button>
                  </div>
                </div>
              )}
              {languageMenuOpen && (
                <div
                  ref={dropdownRefLanguage}
                  className="absolute right-0 z-10 mt-2 w-30 origin-top-right rounded-md shadow-lg ring-1 ring-black/5 focus:outline-none overflow-hidden"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="menu-button"
                  tabIndex={-1}
                  onMouseLeave={() => setLanguageMenuOpen(false)}
                >
                  <div role="none">
                    <button
                      className="w-full block p-2 disabled:opacity-50 h-10 text-sm text-gray-700 px-4 text-left bg-white "
                      onClick={() => i18n.changeLanguage("sl")}
                    >
                      sl
                    </button>
                    <button
                      className="w-full block p-2 disabled:opacity-50 h-10 text-sm text-gray-700 px-4 text-left bg-white "
                      onClick={() => i18n.changeLanguage("en")}
                    >
                      en
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className={`flex-1 flex`}>
          <div className={`divide-y w-[220px] min-w-[220px]`}>
            {(
              [
                ["/statistics", `${t("statistics")}`],
                ["/sellers", `${t("sellers")} (${sellers.length})`],
                ["/buyers", `${t("buyers")} (${buyers.length})`],
                ["/inventory", `${t("inventory")} (${woodPiecesCount})`],
                [
                  "/treeSpecies/edit",
                  `${t("treeSpeciesPlural")} (${treeSpeciesData.length})`,
                ],
                ["/settings", `${t("settings")}`],
              ] as const
            ).map(([to, label]) => {
              return (
                <div key={to} className="">
                  <Link
                    to={to}
                    activeOptions={{}}
                    className={`block py-2 px-3 text-blue-600 bg-[#eee]`}
                    activeProps={{
                      className: `font-bold bg-gray-100 !bg-gray-50`,
                    }}
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
