import type { Buyer } from "../utils/buyerService";

export function BuyerFields({
  buyer,
  disabled,
}: {
  buyer: Buyer;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <h2 className="font-bold text-lg">
        <input
          name="seller_name"
          defaultValue={buyer.buyer_name}
          placeholder="Buyer Title"
          className="border border-opacity-50 rounded p-2 w-full"
          disabled={disabled}
        />
      </h2>
    </div>
  );
}
