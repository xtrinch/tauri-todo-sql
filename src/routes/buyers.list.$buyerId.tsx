import * as React from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { BuyerFields } from '../components/BuyerFields'
import {
  buyerQueryOptions,
  useUpdateBuyerMutation,
} from '../utils/queryOptions'

export const Route = createFileRoute('/buyers/list/$buyerId')({
  params: {
    parse: (params) => ({
      buyerId: z.number().int().parse(Number(params.buyerId)),
    }),
    stringify: ({ buyerId }) => ({ buyerId: `${buyerId}` }),
  },
  validateSearch: (search) =>
    z
      .object({
        showNotes: z.boolean().optional(),
        notes: z.string().optional(),
      })
      .parse(search),
  loader: (opts) =>
    opts.context.queryClient.ensureQueryData(
      buyerQueryOptions(opts.params.buyerId),
    ),
  component: BuyerComponent,
})

function BuyerComponent() {
  const search = Route.useSearch()
  const params = Route.useParams()
  const navigate = useNavigate({ from: Route.fullPath })
  const buyerQuery = useSuspenseQuery(buyerQueryOptions(params.buyerId))
  const buyer = buyerQuery.data
  const updateBuyerMutation = useUpdateBuyerMutation(params.buyerId)
  const [notes, setNotes] = React.useState(search.notes ?? '')

  React.useEffect(() => {
    navigate({
      search: (old) => ({
        ...old,
        notes: notes ? notes : undefined,
      }),
      replace: true,
      params: true,
    })
  }, [notes])

  return (
    <form
      key={buyer.id}
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        const formData = new FormData(event.target as HTMLFormElement)
        updateBuyerMutation.mutate({
          id: buyer.id,
          title: formData.get('title') as string,
          body: formData.get('body') as string,
        })
      }}
      className="p-2 space-y-2"
    >
      <BuyerFields
        buyer={buyer}
        disabled={updateBuyerMutation.status === 'pending'}
      />
      <div>
        <Link
          from={Route.fullPath}
          params={true}
          search={(old) => ({
            ...old,
            showNotes: old.showNotes ? undefined : true,
          })}
          className="text-blue-700"
        >
          {search.showNotes ? 'Close Notes' : 'Show Notes'}{' '}
        </Link>
        {search.showNotes ? (
          <>
            <div>
              <div className="h-2" />
              <textarea
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value)
                }}
                rows={5}
                className="shadow w-full p-2 rounded"
                placeholder="Write some notes here..."
              />
              <div className="italic text-xs">
                Notes are stored in the URL. Try copying the URL into a new tab!
              </div>
            </div>
          </>
        ) : null}
      </div>
      <div>
        <button
          className="bg-blue-500 rounded p-2 uppercase text-white font-black disabled:opacity-50"
          disabled={updateBuyerMutation.status === 'pending'}
        >
          Save
        </button>
      </div>
      {updateBuyerMutation.variables?.id === buyer.id ? (
        <div key={updateBuyerMutation.submittedAt}>
          {updateBuyerMutation.status === 'success' ? (
            <div className="inline-block px-2 py-1 rounded bg-green-500 text-white animate-bounce [animation-iteration-count:2.5] [animation-duration:.3s]">
              Saved!
            </div>
          ) : updateBuyerMutation.status === 'error' ? (
            <div className="inline-block px-2 py-1 rounded bg-red-500 text-white animate-bounce [animation-iteration-count:2.5] [animation-duration:.3s]">
              Failed to save.
            </div>
          ) : null}
        </div>
      ) : null}
    </form>
  )
}
