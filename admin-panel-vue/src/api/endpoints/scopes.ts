import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { Ref } from 'vue'
import client from '../client'
import type { Scope, ScopeDetail, PostScopeReq, PutScopeReq } from '../types'

export const useScopes = () => {
  return useQuery({
    queryKey: ['scopes'],
    queryFn: async () => {
      const response = await client.get<{ scopes: Scope[] }>('/api/v1/scopes')
      return response.scopes
    }
  })
}

export const useScope = (id: Ref<number>) => {
  return useQuery({
    queryKey: ['scopes', id],
    queryFn: async () => {
      const response = await client.get<{ scope: ScopeDetail }>('/api/v1/scopes/' + id.value)
      return response.scope
    },
    enabled: () => !!id.value
  })
}

export const useCreateScope = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PostScopeReq) => client.post<{ scope: ScopeDetail }>('/api/v1/scopes', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['scopes'] })
  })
}

export const useUpdateScope = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PutScopeReq }) =>
      client.put<{ scope: ScopeDetail }>('/api/v1/scopes/' + id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['scopes'] })
  })
}

export const useDeleteScope = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => client.delete('/api/v1/scopes/' + id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['scopes'] })
  })
}
