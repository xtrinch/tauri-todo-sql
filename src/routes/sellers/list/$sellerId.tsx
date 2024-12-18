import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { sellerQueryOptions } from "../../../utils/sellerService";

export const Route = createFileRoute("/sellers/list/$sellerId")({
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
  const search = Route.useParams();
  const sellerQuery = useSuspenseQuery(sellerQueryOptions(search.sellerId));
  const seller = sellerQuery.data;

  return (
    <>
      <Link
        to="/sellers/list/edit/$sellerId"
        params={{
          sellerId: seller.id,
        }}
        className="block py-2 px-3 text-blue-700"
        activeProps={{ className: `font-bold` }}
      >
        <button className="bg-blue-500 rounded p-2 uppercase text-white font-black disabled:opacity-50">
          Edit
        </button>
      </Link>
      <h4 className="p-2 font-bold">{seller?.name}</h4>
      <pre className="text-sm whitespace-pre-wrap">
        {JSON.stringify(seller, null, 2)}
      </pre>
    </>
  );
}
