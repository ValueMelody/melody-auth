import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { Ref } from 'vue'
import client from '../client'
import type { App, AppDetail, CreatedAppDetail, PostAppReq, PutAppReq } from '../types'

export const useApps = () => {
  return useQuery({
    queryKey: ['apps'],
    queryFn: async () => {
      const response = await client.get<{ apps: App[] }>('/api/v1/apps')
      return response.apps
    }
  })
}

export const useApp = (id: Ref<number>) => {
  return useQuery({
    queryKey: ['apps', id],
    queryFn: async () => {
      const response = await client.get<{ app: AppDetail }>('/api/v1/apps/' + id.value)
      return response.app
    },
    enabled: () => !!id.value
  })
}

export const useCreateApp = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PostAppReq) => client.post<{ app: CreatedAppDetail }>('/api/v1/apps', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['apps'] })
  })
}

export const useUpdateApp = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PutAppReq }) =>
      client.put<{ app: AppDetail }>('/api/v1/apps/' + id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['apps'] })
  })
}

export const useDeleteApp = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => client.delete('/api/v1/apps/' + id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['apps'] })
  })
}
