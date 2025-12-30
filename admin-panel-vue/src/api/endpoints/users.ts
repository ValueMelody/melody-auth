import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { Ref } from 'vue'
import client from '../client'
import type { User, UserDetail, PutUserReq, UserConsentedApp, UserPasskey, PaginationParams, Org } from '../types'

export const useUsers = (params: Ref<PaginationParams>) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: async () => {
      const response = await client.get<{ users: User[]; count: number }>('/api/v1/users', {
        params: { page_size: params.value.pageSize, page_number: params.value.pageNumber, search: params.value.search }
      })
      return response
    }
  })
}

export const useUser = (authId: Ref<string>) => {
  return useQuery({
    queryKey: ['users', authId],
    queryFn: async () => {
      const response = await client.get<{ user: UserDetail }>('/api/v1/users/' + authId.value)
      return response.user
    },
    enabled: () => !!authId.value
  })
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ authId, data }: { authId: string; data: PutUserReq }) =>
      client.put<{ user: UserDetail }>('/api/v1/users/' + authId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] })
  })
}

export const useDeleteUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (authId: string) => client.delete('/api/v1/users/' + authId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] })
  })
}

export const useUserLockedIps = (authId: Ref<string>) => {
  return useQuery({
    queryKey: ['users', authId, 'locked-ips'],
    queryFn: async () => {
      const response = await client.get<{ lockedIPs: string[] }>('/api/v1/users/' + authId.value + '/locked-ips')
      return response.lockedIPs
    },
    enabled: () => !!authId.value
  })
}

export const useUnlockUserIps = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (authId: string) => client.delete('/api/v1/users/' + authId + '/locked-ips'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] })
  })
}

export const useSendVerifyEmail = () => {
  return useMutation({
    mutationFn: (authId: string) => client.post('/api/v1/users/' + authId + '/verify-email')
  })
}

export const useUserConsentedApps = (authId: Ref<string>) => {
  return useQuery({
    queryKey: ['users', authId, 'consented-apps'],
    queryFn: async () => {
      const response = await client.get<{ consentedApps: UserConsentedApp[] }>('/api/v1/users/' + authId.value + '/consented-apps')
      return response.consentedApps
    },
    enabled: () => !!authId.value
  })
}

export const useRevokeUserConsent = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ authId, appId }: { authId: string; appId: number }) =>
      client.delete('/api/v1/users/' + authId + '/consented-apps/' + appId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] })
  })
}

export const useUserPasskeys = (authId: Ref<string>) => {
  return useQuery({
    queryKey: ['users', authId, 'passkeys'],
    queryFn: async () => {
      const response = await client.get<{ passkeys: UserPasskey[] }>('/api/v1/users/' + authId.value + '/passkeys')
      return response.passkeys
    },
    enabled: () => !!authId.value
  })
}

export const useDeleteUserPasskey = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ authId, passkeyId }: { authId: string; passkeyId: number }) =>
      client.delete('/api/v1/users/' + authId + '/passkeys/' + passkeyId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] })
  })
}

export const useEnrollEmailMfa = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (authId: string) => client.post('/api/v1/users/' + authId + '/email-mfa'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] })
  })
}

export const useResetEmailMfa = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (authId: string) => client.delete('/api/v1/users/' + authId + '/email-mfa'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] })
  })
}

export const useEnrollOtpMfa = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (authId: string) => client.post('/api/v1/users/' + authId + '/otp-mfa'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] })
  })
}

export const useResetOtpMfa = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (authId: string) => client.delete('/api/v1/users/' + authId + '/otp-mfa'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] })
  })
}

export const useEnrollSmsMfa = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (authId: string) => client.post('/api/v1/users/' + authId + '/sms-mfa'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] })
  })
}

export const useResetSmsMfa = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (authId: string) => client.delete('/api/v1/users/' + authId + '/sms-mfa'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] })
  })
}

export const useLinkAccount = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ authId, linkingAuthId }: { authId: string; linkingAuthId: string }) =>
      client.post('/api/v1/users/' + authId + '/account-linking/' + linkingAuthId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] })
  })
}

export const useUnlinkAccount = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (authId: string) => client.delete('/api/v1/users/' + authId + '/account-linking'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] })
  })
}

export const useImpersonateUser = () => {
  return useMutation({
    mutationFn: ({ authId, appId, impersonatorToken }: { authId: string; appId: number; impersonatorToken: string }) =>
      client.post<{ refresh_token: string; refresh_token_expires_on: number; refresh_token_expires_in: number }>(
        '/api/v1/users/' + authId + '/impersonation/' + appId,
        { impersonatorToken }
      )
  })
}

export const useUserOrgs = (authId: Ref<string>) => {
  return useQuery({
    queryKey: ['users', authId, 'orgs'],
    queryFn: async () => {
      const response = await client.get<{ orgs: Org[] }>('/api/v1/users/' + authId.value + '/orgs')
      return response.orgs
    },
    enabled: () => !!authId.value
  })
}

export const useUpdateUserOrgs = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ authId, orgs }: { authId: string; orgs: number[] }) =>
      client.post('/api/v1/users/' + authId + '/orgs', { orgs }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] })
  })
}

export const useAddUserToOrgGroup = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ authId, orgGroupId }: { authId: string; orgGroupId: number }) =>
      client.post('/api/v1/users/' + authId + '/org-groups/' + orgGroupId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] })
  })
}

export const useRemoveUserFromOrgGroup = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ authId, orgGroupId }: { authId: string; orgGroupId: number }) =>
      client.delete('/api/v1/users/' + authId + '/org-groups/' + orgGroupId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] })
  })
}
