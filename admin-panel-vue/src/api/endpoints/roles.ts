import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { Ref } from 'vue'
import client from '../client'
import type { Role, PostRoleReq, PutRoleReq, User } from '../types'

export const useRoles = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const response = await client.get<{ roles: Role[] }>('/api/v1/roles')
      return response.roles
    }
  })
}

export const useRole = (id: Ref<number>) => {
  return useQuery({
    queryKey: ['roles', id],
    queryFn: async () => {
      const response = await client.get<{ role: Role }>('/api/v1/roles/' + id.value)
      return response.role
    },
    enabled: () => !!id.value
  })
}

export const useRoleUsers = (id: Ref<number>) => {
  return useQuery({
    queryKey: ['roles', id, 'users'],
    queryFn: async () => {
      const response = await client.get<{ users: User[] }>('/api/v1/roles/' + id.value + '/users')
      return response.users
    },
    enabled: () => !!id.value
  })
}

export const useCreateRole = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PostRoleReq) => client.post<{ role: Role }>('/api/v1/roles', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] })
  })
}

export const useUpdateRole = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PutRoleReq }) =>
      client.put<{ role: Role }>('/api/v1/roles/' + id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] })
  })
}

export const useDeleteRole = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => client.delete('/api/v1/roles/' + id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] })
  })
}
