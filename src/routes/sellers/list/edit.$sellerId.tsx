import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { z } from "zod";
import { SellerFields } from "../../../components/SellerFields";
import {
  sellerQueryOptions,
  useUpdateSellerMutation,
} from "../../../utils/sellerService";

export const Route = createFileRoute("/sellers/list/edit/$sellerId")({
  params: {
    parse: (params) => ({
      sellerId: z.number().int().parse(Number(params.sellerId)),
    }),
    stringify: ({ sellerId }) => ({ sellerId: `${sellerId}` }),
  },
  loader: (opts) =>
    opts.context.queryClient.ensureQueryData(
      sellerQueryOptions(opts.params.sellerId)
    ),
  component: SellerComponent,
});

function SellerComponent() {
  const params = Route.useParams();
  const navigate = useNavigate({ from: Route.fullPath });
  const sellerQuery = useSuspenseQuery(sellerQueryOptions(params.sellerId));
  const seller = sellerQuery.data;
  const updateSellerMutation = useUpdateSellerMutation(params.sellerId, () => {
    navigate({
      to: "/sellers/list/$sellerId",
      params: { sellerId: params.sellerId },
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
      key={seller.id}
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        const formData = new FormData(event.target as HTMLFormElement);
        updateSellerMutation.mutate({
          id: seller.id,
          name: formData.get("name") as string,
        });
      }}
      className="p-2 space-y-2"
    >
      <SellerFields
        seller={seller}
        disabled={updateSellerMutation.status === "pending"}
      />

      <div>
        <button
          className="bg-blue-500 rounded p-2 uppercase text-white font-black disabled:opacity-50"
          disabled={updateSellerMutation.status === "pending"}
        >
          Save
        </button>
      </div>
      {updateSellerMutation.variables?.id === seller.id ? (
        <div key={updateSellerMutation.submittedAt}>
          {updateSellerMutation.status === "success" ? (
            <div className="inline-block px-2 py-1 rounded bg-green-500 text-white animate-bounce [animation-iteration-count:2.5] [animation-duration:.3s]">
              Saved!
            </div>
          ) : updateSellerMutation.status === "error" ? (
            <div className="inline-block px-2 py-1 rounded bg-red-500 text-white animate-bounce [animation-iteration-count:2.5] [animation-duration:.3s]">
              Failed to save.
            </div>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
