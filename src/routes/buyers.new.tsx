import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { BuyerFields } from '../components/BuyerFields'
import { Spinner } from '../components/Spinner'
import { useCreateBuyerMutation } from '../utils/queryOptions'
import type { Buyer } from '../utils/buyerService'

export const Route = createFileRoute('/buyers/new')({
  component: BuyersIndexComponent,
})

function BuyersIndexComponent() {
  const createBuyerMutation = useCreateBuyerMutation()

  return (
    <>
      <div className="p-2">
        <form
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            const formData = new FormData(event.target as HTMLFormElement)
            createBuyerMutation.mutate({
              name: formData.get('name') as string,
            })
          }}
          className="space-y-2"
        >
          <div>Dodaj kupca:</div>
          <BuyerFields buyer={{} as Buyer} />
          <div>
            <button
              className="bg-blue-500 rounded p-2 uppercase text-white font-black disabled:opacity-50"
              disabled={createBuyerMutation.status === 'pending'}
            >
              {createBuyerMutation.status === 'pending' ? (
                <>
                  Creating <Spinner />
                </>
              ) : (
                'Create'
              )}
            </button>
          </div>
          {createBuyerMutation.status === 'success' ? (
            <div className="inline-block px-2 py-1 rounded bg-green-500 text-white animate-bounce [animation-iteration-count:2.5] [animation-duration:.3s]">
              Created!
            </div>
          ) : createBuyerMutation.status === 'error' ? (
            <div className="inline-block px-2 py-1 rounded bg-red-500 text-white animate-bounce [animation-iteration-count:2.5] [animation-duration:.3s]">
              Failed to create.
            </div>
          ) : null}
        </form>
      </div>
    </>
  )
}
