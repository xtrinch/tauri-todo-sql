import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { z } from "zod";
import { BuyerFields } from "../../../components/BuyerFields";
import {
  buyerQueryOptions,
  useUpdateBuyerMutation,
} from "../../../utils/buyerService";

export const Route = createFileRoute("/buyers/list/edit/$buyerId")({
  params: {
    parse: (params) => ({
      buyerId: z.number().int().parse(Number(params.buyerId)),
    }),
    stringify: ({ buyerId }) => ({ buyerId: `${buyerId}` }),
  },
  loader: (opts) =>
    opts.context.queryClient.ensureQueryData(
      buyerQueryOptions(opts.params.buyerId)
    ),
  component: BuyerComponent,
});

function BuyerComponent() {
  const params = Route.useParams();
  const navigate = useNavigate({ from: Route.fullPath });
  const buyerQuery = useSuspenseQuery(buyerQueryOptions(params.buyerId));
  const buyer = buyerQuery.data;
  const updateBuyerMutation = useUpdateBuyerMutation(params.buyerId, () => {
    navigate({
      to: "/buyers/list/$buyerId",
      params: { buyerId: params.buyerId },
    });
  });

  React.useEffect(() => {
    navigate({
      search: (old) => ({
        ...old,
      }),
      replace: true,
      params: true,
    });
  }, []);

  return (
    <form
      key={buyer.id}
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        const formData = new FormData(event.target as HTMLFormElement);
        updateBuyerMutation.mutate({
          id: buyer.id,
          name: formData.get("name") as string,
        });
      }}
      className="p-2 space-y-2"
    >
      <BuyerFields
        buyer={buyer}
        disabled={updateBuyerMutation.status === "pending"}
      />

      <div>
        <button
          className="bg-blue-500 rounded p-2 uppercase text-white font-black disabled:opacity-50"
          disabled={updateBuyerMutation.status === "pending"}
        >
          Save
        </button>
      </div>
      {updateBuyerMutation.variables?.id === buyer.id ? (
        <div key={updateBuyerMutation.submittedAt}>
          {updateBuyerMutation.status === "success" ? (
            <div className="inline-block px-2 py-1 rounded bg-green-500 text-white animate-bounce [animation-iteration-count:2.5] [animation-duration:.3s]">
              Saved!
            </div>
          ) : updateBuyerMutation.status === "error" ? (
            <div className="inline-block px-2 py-1 rounded bg-red-500 text-white animate-bounce [animation-iteration-count:2.5] [animation-duration:.3s]">
              Failed to save.
            </div>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
