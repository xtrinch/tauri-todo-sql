import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { buyerQueryOptions } from "../../../utils/buyerService";

export const Route = createFileRoute("/buyers/list/$buyerId")({
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
  const search = Route.useParams();
  const buyerQuery = useSuspenseQuery(buyerQueryOptions(search.buyerId));
  const buyer = buyerQuery.data;

  return (
    <>
      <Link
        to="/buyers/list/edit/$buyerId"
        params={{
          buyerId: buyer.id,
        }}
        className="block py-2 px-3 text-blue-700"
        activeProps={{ className: `font-bold` }}
      >
        <button className="bg-blue-500 rounded p-2 uppercase text-white font-black disabled:opacity-50">
          Edit
        </button>
      </Link>
      <h4 className="p-2 font-bold">{buyer?.name}</h4>
      <pre className="text-sm whitespace-pre-wrap">
        {JSON.stringify(buyer, null, 2)}
      </pre>
    </>
  );
}
