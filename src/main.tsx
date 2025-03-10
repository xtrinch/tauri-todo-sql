import "@fontsource/roboto"; // Defaults to weight 400
import { Font } from "@react-pdf/renderer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  ErrorComponent,
  RouterProvider,
  createRouter,
} from "@tanstack/react-router";
import ReactDOM from "react-dom/client";
import { default as fontBold } from "./assets/fonts/Roboto-Bold.ttf";
import { default as font } from "./assets/fonts/Roboto-Regular.ttf";
import { Spinner } from "./components/Spinner";
import "./index.css";
import { routeTree } from "./routeTree.gen";

Font.register({
  family: "Roboto",
  src: font,
  fontWeight: "normal",
  fontStyle: "normal",
});
Font.register({
  family: "Roboto",
  src: fontBold,
  fontWeight: "bold",
  fontStyle: "normal",
});

export const queryClient = new QueryClient();

const router = createRouter({
  routeTree,
  defaultPendingComponent: () => (
    <div className={`p-2 text-2xl`}>
      <Spinner />
    </div>
  ),
  defaultErrorComponent: ({ error }) => <ErrorComponent error={error} />,
  context: {
    queryClient,
  },
  defaultPreload: "intent",
  // Since we're using React Query, we don't want loader calls to ever be stale
  // This will ensure that the loader is always called when the route is preloaded or visited
  defaultPreloadStaleTime: 0,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function App() {
  return (
    <>
      <RouterProvider
        router={router}
        defaultPreload="intent"
        defaultPendingMs={0}
        defaultPendingMinMs={0}
      />
    </>
  );
}

const rootElement = document.getElementById("app")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
}
