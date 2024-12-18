import { queryOptions, useMutation } from '@tanstack/react-query'
import {
  fetchInvoiceById,
  fetchInvoices,
  fetchUserById,
  fetchUsers,
  patchInvoice,
  postInvoice,
} from './mockTodos'

import { queryClient } from '../main'
import { fetchBuyerById, fetchBuyers, postBuyer } from './buyerService'

export const invoicesQueryOptions = () =>
  queryOptions({
    queryKey: ['invoices'],
    queryFn: () => fetchInvoices(),
  })

  export const buyersQueryOptions = () =>
    queryOptions({
      queryKey: ['buyers'],
      queryFn: () => fetchBuyers(),
    })

    
export const invoiceQueryOptions = (invoiceId: number) =>
  queryOptions({
    queryKey: ['invoices', invoiceId],
    queryFn: () => fetchInvoiceById(invoiceId),
  })

  export const buyerQueryOptions = (buyerId: number) =>
    queryOptions({
      queryKey: ['buyers', buyerId],
      queryFn: () => fetchBuyerById(buyerId),
    })

    
export const usersQueryOptions = (opts: {
  filterBy?: string
  sortBy?: 'name' | 'id' | 'email'
}) =>
  queryOptions({
    queryKey: ['users', opts],
    queryFn: () => fetchUsers(opts),
  })

export const userQueryOptions = (userId: number) =>
  queryOptions({
    queryKey: ['users', userId],
    queryFn: () => fetchUserById(userId),
  })

export const useCreateInvoiceMutation = () => {
  return useMutation({
    // mutationKey: ['invoices', 'create'],
    mutationFn: postInvoice,
    onSuccess: () => queryClient.invalidateQueries(),
  })
}

export const useCreateBuyerMutation = () => {
  return useMutation({
    mutationFn: postBuyer,
    onSuccess: () => queryClient.invalidateQueries(),
  })
}

export const useUpdateInvoiceMutation = (invoiceId: number) => {
  return useMutation({
    mutationKey: ['invoices', 'update', invoiceId],
    mutationFn: patchInvoice,
    onSuccess: () => queryClient.invalidateQueries(),
    gcTime: 1000 * 10,
  })
}

export const useUpdateBuyerMutation = (invoiceId: number) => {
  return useMutation({
    mutationKey: ['invoices', 'update', invoiceId],
    mutationFn: patchInvoice,
    onSuccess: () => queryClient.invalidateQueries(),
    gcTime: 1000 * 10,
  })
}
