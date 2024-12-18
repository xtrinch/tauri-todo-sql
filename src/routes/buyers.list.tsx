import * as React from 'react'
import {
  Link,
  MatchRoute,
  Outlet,
  createFileRoute,
} from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Spinner } from '../components/Spinner'
import { buyersQueryOptions } from '../utils/buyerService'

export const Route = createFileRoute('/buyers/list')({
  loader: (opts) =>
    opts.context.queryClient.ensureQueryData(buyersQueryOptions()),
  component: BuyersComponent,
})

function BuyersComponent() {
  const buyersQuery = useSuspenseQuery(buyersQueryOptions())
  const buyers = buyersQuery.data

  return (
    <div className="flex-1 flex">
      <div className="divide-y w-48">
        {buyers.map((buyer) => {
          return (
            <div key={buyer.id}>
              <Link
                to="/buyers/list/$buyerId"
                params={{
                  buyerId: buyer.id,
                }}
                preload="intent"
                className="block py-2 px-3 text-blue-700"
                activeProps={{ className: `font-bold` }}
              >
                <pre className="text-sm">
                  #{buyer.id} - {buyer.name.slice(0, 10)}{' '}
                  <MatchRoute
                    to="/buyers/list/$buyerId"
                    params={{
                      buyerId: buyer.id,
                    }}
                    pending
                  >
                    {(match) => <Spinner show={!!match} wait="delay-50" />}
                  </MatchRoute>
                </pre>
              </Link>
            </div>
          )
        })}
      </div>
      <div className="flex-1 border-l">
        <Outlet />
      </div>
    </div>
  )
}
