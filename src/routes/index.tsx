import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: IndexComponent,
  beforeLoad: ({ location, params }) => {
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
  return (
    <div className={`p-2`}>
      <div className={`text-lg`}>Welcome Home!</div>
      <hr className={`my-2`} />
      <hr className={`my-2`} />
      <div className={`max-w-xl`}>:)</div>
    </div>
  );
}
