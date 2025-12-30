import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { Ref } from 'vue'
import client from '../client'
import type { UserAttribute, PostUserAttributeReq, PutUserAttributeReq } from '../types'

export const useUserAttributes = () => {
  return useQuery({
    queryKey: ['user-attributes'],
    queryFn: async () => {
      const response = await client.get<{ userAttributes: UserAttribute[] }>('/api/v1/user-attributes')
      return response.userAttributes
    }
  })
}

export const useUserAttribute = (id: Ref<number>) => {
  return useQuery({
    queryKey: ['user-attributes', id],
    queryFn: async () => {
      const response = await client.get<{ userAttribute: UserAttribute }>('/api/v1/user-attributes/' + id.value)
      return response.userAttribute
    },
    enabled: () => !!id.value
  })
}

export const useCreateUserAttribute = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PostUserAttributeReq) =>
      client.post<{ userAttribute: UserAttribute }>('/api/v1/user-attributes', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user-attributes'] })
  })
}

export const useUpdateUserAttribute = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PutUserAttributeReq }) =>
      client.put<{ userAttribute: UserAttribute }>('/api/v1/user-attributes/' + id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user-attributes'] })
  })
}

export const useDeleteUserAttribute = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => client.delete('/api/v1/user-attributes/' + id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user-attributes'] })
  })
}
