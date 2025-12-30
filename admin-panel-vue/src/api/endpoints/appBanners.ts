import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { Ref } from 'vue'
import client from '../client'
import type { AppBanner, PostAppBannerReq, PutAppBannerReq } from '../types'

export const useAppBanners = () => {
  return useQuery({
    queryKey: ['app-banners'],
    queryFn: async () => {
      const response = await client.get<{ appBanners: AppBanner[] }>('/api/v1/app-banners')
      return response.appBanners
    }
  })
}

export const useAppBanner = (id: Ref<number>) => {
  return useQuery({
    queryKey: ['app-banners', id],
    queryFn: async () => {
      const response = await client.get<{ appBanner: AppBanner }>('/api/v1/app-banners/' + id.value)
      return response.appBanner
    },
    enabled: () => !!id.value
  })
}

export const useCreateAppBanner = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PostAppBannerReq) =>
      client.post<{ appBanner: AppBanner }>('/api/v1/app-banners', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['app-banners'] })
  })
}

export const useUpdateAppBanner = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PutAppBannerReq }) =>
      client.put<{ appBanner: AppBanner }>('/api/v1/app-banners/' + id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['app-banners'] })
  })
}

export const useDeleteAppBanner = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => client.delete('/api/v1/app-banners/' + id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['app-banners'] })
  })
}
