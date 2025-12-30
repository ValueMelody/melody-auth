import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { Ref } from 'vue'
import client from '../client'
import type { OrgGroup, PostOrgGroupReq, PutOrgGroupReq, User } from '../types'

export const useOrgGroups = (orgId: Ref<number | undefined>) => {
  return useQuery({
    queryKey: ['org-groups', orgId],
    queryFn: async () => {
      const response = await client.get<{ orgGroups: OrgGroup[] }>('/api/v1/org-groups', {
        params: { org_id: orgId.value }
      })
      return response.orgGroups
    },
    enabled: () => !!orgId.value
  })
}

export const useOrgGroupUsers = (id: Ref<number>) => {
  return useQuery({
    queryKey: ['org-groups', id, 'users'],
    queryFn: async () => {
      const response = await client.get<{ users: User[] }>('/api/v1/org-groups/' + id.value + '/users')
      return response.users
    },
    enabled: () => !!id.value
  })
}

export const useCreateOrgGroup = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PostOrgGroupReq) =>
      client.post<{ orgGroup: OrgGroup }>('/api/v1/org-groups', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['org-groups'] })
  })
}

export const useUpdateOrgGroup = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PutOrgGroupReq }) =>
      client.put<{ orgGroup: OrgGroup }>('/api/v1/org-groups/' + id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['org-groups'] })
  })
}

export const useDeleteOrgGroup = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => client.delete('/api/v1/org-groups/' + id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['org-groups'] })
  })
}
