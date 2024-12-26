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
import { useEffect, useState } from "react";
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
  const { mutate: undo } = useUndo(() => {
    queryClient.invalidateQueries();
  });

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
      await invoke("dump_sqlite_db", { filePath: path });
      setFilePath(path);
    }
  };

  const saveOnly = async () => {
    if (filePath) {
      await invoke("dump_sqlite_db", { filePath: filePath });
    }
  };

  const loadFile = async () => {
    const path = await open({
      multiple: false,
      directory: false,
      filters: [{ name: "My Filter", extensions: ["dump"] }],
    });

    if (path) {
      await invoke("load_sqlite_db", { filePath: path });
      await queryClient.invalidateQueries();
      setFilePath(path);
    }
  };

  const [filePath, setFilePath] = useState<string | null>(
    localStorage.getItem("file_path2")
  );
  useEffect(() => {
    localStorage.setItem("file_path2", filePath || undefined!);
  }, [filePath]);

  return (
    <>
      <div className={`min-h-screen flex flex-col`}>
        <div className={`flex items-center justify-between border-b gap-2`}>
          <h1 className={`text-3xl p-2`}>App</h1>

          {/* Show a global spinner when the router is transitioning */}
          <div className="flex flex-row pr-2 space-x-2 items-center">
            <div className={`text-3xl`}>
              <RouterSpinner />
            </div>
            <div className="text-sm">{filePath || ""}</div>
            {filePath && (
              <button
                className="bg-blue-500 rounded p-2 uppercase text-white font-black disabled:opacity-50 h-10"
                onClick={() => saveOnly()}
              >
                Save
              </button>
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
