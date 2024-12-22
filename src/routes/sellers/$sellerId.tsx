import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { z } from "zod";
import { SellerTable } from "../../components/SellerTable";
import { sellerQueryOptions } from "../../utils/sellerService";

export const Route = createFileRoute("/sellers/$sellerId")({
  params: {
    parse: (params) => ({
      sellerId: z.number().int().parse(Number(params.sellerId)),
    }),
    stringify: ({ sellerId }) => ({ sellerId: `${sellerId}` }),
  },
  component: SellerComponent,
  beforeLoad: ({ location, params }) => {
    const shouldRedirect = [`/sellers/${params.sellerId}`].includes(
      location.pathname
    );

    if (shouldRedirect) {
      redirect({
        to: "/sellers/$sellerId/wood-pieces-list",
        throw: true,
        params: { sellerId: params.sellerId },
      });
    }
  },
});

function SellerComponent() {
  const params = Route.useParams();
  const sellerQuery = useSuspenseQuery(sellerQueryOptions(params.sellerId));
  const seller = sellerQuery.data;

  return (
    <div className="flex flex-col space-y-3">
      <h3>Seller</h3>
      <SellerTable seller={seller} />
      <h3>Wood pieces</h3>
      <Outlet />
    </div>
  );
}
