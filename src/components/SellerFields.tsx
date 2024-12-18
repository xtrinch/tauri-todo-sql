import type { Seller } from "../utils/sellerService";

export function SellerFields({
  seller,
  disabled,
}: {
  seller: Seller;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <h2 className="font-bold text-lg">
        <input
          name="name"
          defaultValue={seller.name}
          placeholder="Seller Title"
          className="border border-opacity-50 rounded p-2 w-full"
          disabled={disabled}
        />
      </h2>
    </div>
  );
}
