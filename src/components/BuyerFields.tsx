import * as React from 'react'
import type { Buyer } from '../utils/buyerService'

export function BuyerFields({
  buyer,
  disabled,
}: {
  buyer: Buyer
  disabled?: boolean
}) {
  return (
    <div className="space-y-2">
      <h2 className="font-bold text-lg">
        <input
          name="title"
          defaultValue={buyer.name}
          placeholder="Buyer Title"
          className="border border-opacity-50 rounded p-2 w-full"
          disabled={disabled}
        />
      </h2>
      {/* <div>
        <textarea
          name="body"
          defaultValue={buyer.body}
          rows={6}
          placeholder="Buyer Body..."
          className="border border-opacity-50 p-2 rounded w-full"
          disabled={disabled}
        />
      </div> */}
    </div>
  )
}
