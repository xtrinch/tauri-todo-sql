import { createFileRoute, redirect } from "@tanstack/react-router";
import "./../utils/i18n";

export const Route = createFileRoute("/")({
  component: IndexComponent,
  beforeLoad: ({ location }) => {
    const shouldRedirect = [`/`].includes(location.pathname);

    if (shouldRedirect) {
      redirect({
        to: "/sellers",
        throw: true,
      });
    }
  },
});

function IndexComponent() {
  return null;
}
