import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SellerFields } from "../../components/SellerFields";
import { Spinner } from "../../components/Spinner";
import { Seller, useCreateSellerMutation } from "../../utils/sellerService";

export const Route = createFileRoute("/sellers/new")({
  component: SellersIndexComponent,
});

function SellersIndexComponent() {
  const navigate = useNavigate();
  const createSellerMutation = useCreateSellerMutation((seller: Seller) => {
    navigate({
      to: "/sellers/list/$sellerId",
      params: { sellerId: seller.id },
    });
  });

  return (
    <>
      <div className="p-2">
        <form
          spellCheck={false}
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            const formData = new FormData(event.target as HTMLFormElement);
            createSellerMutation.mutate({
              name: formData.get("name") as string,
            });
          }}
          className="space-y-2"
        >
          <SellerFields seller={{} as Seller} />
          <div>
            <button
              className="bg-blue-500 rounded p-2 uppercase text-white font-black disabled:opacity-50"
              disabled={createSellerMutation.status === "pending"}
            >
              {createSellerMutation.status === "pending" ? (
                <>
                  Creating <Spinner />
                </>
              ) : (
                "Create"
              )}
            </button>
          </div>
          {createSellerMutation.status === "success" ? (
            <div className="inline-block px-2 py-1 rounded bg-green-500 text-white animate-bounce [animation-iteration-count:2.5] [animation-duration:.3s]">
              Created!
            </div>
          ) : createSellerMutation.status === "error" ? (
            <div className="inline-block px-2 py-1 rounded bg-red-500 text-white animate-bounce [animation-iteration-count:2.5] [animation-duration:.3s]">
              Failed to create.
            </div>
          ) : null}
        </form>
      </div>
    </>
  );
}
