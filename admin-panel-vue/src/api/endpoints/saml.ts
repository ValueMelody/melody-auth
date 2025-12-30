import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { Ref } from 'vue'
import client from '../client'
import type { SamlIdp, PostSamlIdpReq, PutSamlIdpReq } from '../types'

export const useSamlIdps = () => {
  return useQuery({
    queryKey: ['saml'],
    queryFn: async () => {
      const response = await client.get<{ idps: SamlIdp[] }>('/api/v1/saml/idps')
      return response.idps
    }
  })
}

export const useSamlIdp = (id: Ref<number>) => {
  return useQuery({
    queryKey: ['saml', id],
    queryFn: async () => {
      const response = await client.get<{ idp: SamlIdp }>('/api/v1/saml/idps/' + id.value)
      return response.idp
    },
    enabled: () => !!id.value
  })
}

export const useCreateSamlIdp = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PostSamlIdpReq) => client.post<{ idp: SamlIdp }>('/api/v1/saml/idps', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['saml'] })
  })
}

export const useUpdateSamlIdp = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PutSamlIdpReq }) =>
      client.put<{ idp: SamlIdp }>('/api/v1/saml/idps/' + id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['saml'] })
  })
}

export const useDeleteSamlIdp = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => client.delete('/api/v1/saml/idps/' + id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['saml'] })
  })
}
