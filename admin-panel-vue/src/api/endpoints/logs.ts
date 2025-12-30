import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { Ref } from 'vue'
import client from '../client'
import type { EmailLog, SmsLog, SignInLog, PaginationParams } from '../types'

export const useEmailLogs = (params: Ref<PaginationParams>) => {
  return useQuery({
    queryKey: ['logs', 'email', params],
    queryFn: async () => {
      const response = await client.get<{ logs: EmailLog[]; count: number }>('/api/v1/logs/email', {
        params: { page_size: params.value.pageSize, page_number: params.value.pageNumber }
      })
      return response
    }
  })
}

export const useEmailLog = (id: Ref<number>) => {
  return useQuery({
    queryKey: ['logs', 'email', id],
    queryFn: async () => {
      const response = await client.get<{ log: EmailLog }>('/api/v1/logs/email/' + id.value)
      return response.log
    },
    enabled: () => !!id.value
  })
}

export const useDeleteEmailLogs = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (before: string) => client.delete('/api/v1/logs/email', { params: { before } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['logs', 'email'] })
  })
}

export const useSmsLogs = (params: Ref<PaginationParams>) => {
  return useQuery({
    queryKey: ['logs', 'sms', params],
    queryFn: async () => {
      const response = await client.get<{ logs: SmsLog[]; count: number }>('/api/v1/logs/sms', {
        params: { page_size: params.value.pageSize, page_number: params.value.pageNumber }
      })
      return response
    }
  })
}

export const useSmsLog = (id: Ref<number>) => {
  return useQuery({
    queryKey: ['logs', 'sms', id],
    queryFn: async () => {
      const response = await client.get<{ log: SmsLog }>('/api/v1/logs/sms/' + id.value)
      return response.log
    },
    enabled: () => !!id.value
  })
}

export const useDeleteSmsLogs = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (before: string) => client.delete('/api/v1/logs/sms', { params: { before } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['logs', 'sms'] })
  })
}

export const useSignInLogs = (params: Ref<PaginationParams>) => {
  return useQuery({
    queryKey: ['logs', 'sign-in', params],
    queryFn: async () => {
      const response = await client.get<{ logs: SignInLog[]; count: number }>('/api/v1/logs/sign-in', {
        params: { page_size: params.value.pageSize, page_number: params.value.pageNumber }
      })
      return response
    }
  })
}

export const useSignInLog = (id: Ref<number>) => {
  return useQuery({
    queryKey: ['logs', 'sign-in', id],
    queryFn: async () => {
      const response = await client.get<{ log: SignInLog }>('/api/v1/logs/sign-in/' + id.value)
      return response.log
    },
    enabled: () => !!id.value
  })
}

export const useDeleteSignInLogs = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (before: string) => client.delete('/api/v1/logs/sign-in', { params: { before } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['logs', 'sign-in'] })
  })
}
