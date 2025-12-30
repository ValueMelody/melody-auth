import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { Ref } from 'vue'
import client from '../client'
import type { Org, PostOrgReq, PutOrgReq, User, PaginationParams } from '../types'

export const useOrgs = () => {
  return useQuery({
    queryKey: ['orgs'],
    queryFn: async () => {
      const response = await client.get<{ orgs: Org[] }>('/api/v1/orgs')
      return response.orgs
    }
  })
}

export const useOrg = (id: Ref<number>) => {
  return useQuery({
    queryKey: ['orgs', id],
    queryFn: async () => {
      const response = await client.get<{ org: Org }>('/api/v1/orgs/' + id.value)
      return response.org
    },
    enabled: () => !!id.value
  })
}

export const useOrgUsers = (id: Ref<number>, params: Ref<PaginationParams>) => {
  return useQuery({
    queryKey: ['orgs', id, 'users', params],
    queryFn: async () => {
      const response = await client.get<{ users: User[]; count: number }>('/api/v1/orgs/' + id.value + '/users', {
        params: { page_size: params.value.pageSize, page_number: params.value.pageNumber, search: params.value.search }
      })
      return response
    },
    enabled: () => !!id.value
  })
}

export const useOrgAllUsers = (id: Ref<number>, params: Ref<PaginationParams>) => {
  return useQuery({
    queryKey: ['orgs', id, 'all-users', params],
    queryFn: async () => {
      const response = await client.get<{ users: User[]; count: number }>('/api/v1/orgs/' + id.value + '/all-users', {
        params: { page_size: params.value.pageSize, page_number: params.value.pageNumber }
      })
      return response
    },
    enabled: () => !!id.value
  })
}

export const useCreateOrg = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PostOrgReq) => client.post<{ org: Org }>('/api/v1/orgs', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orgs'] })
  })
}

export const useUpdateOrg = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PutOrgReq }) =>
      client.put<{ org: Org }>('/api/v1/orgs/' + id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orgs'] })
  })
}

export const useDeleteOrg = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => client.delete('/api/v1/orgs/' + id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orgs'] })
  })
}

export const useVerifyOrgDomain = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => client.post<{ org: Org }>('/api/v1/orgs/' + id + '/verify-domain'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orgs'] })
  })
}
