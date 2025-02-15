import {
  describe, it, expect, vi, beforeEach,
} from 'vitest'
import { sendNextRequest } from './proxy'
import { errorSignal } from 'signals'

describe(
  'sendNextRequest',
  () => {
    beforeEach(() => {
    // Reset errorSignal before each test
      errorSignal.value = ''
    })

    it(
      'should set errorSignal value when request fails',
      async () => {
        // Mock fetch with a failed response
        global.fetch = vi.fn().mockResolvedValue({
          ok: false,
          text: () => Promise.resolve('Error message from server'),
        })

        const result = await sendNextRequest({
          endpoint: 'https://api.example.com/test',
          method: 'GET',
        })

        // Check that errorSignal was set with the error message
        expect(errorSignal.value).toBe('Error message from server')
        // Check that the function returns undefined when there's an error
        expect(result).toBeUndefined()
      },
    )

    it(
      'should return data and clear errorSignal when request succeeds',
      async () => {
        const mockResponse = { data: 'test response' }

        // Mock fetch with a successful response
        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        })

        const result = await sendNextRequest({
          endpoint: 'https://api.example.com/test',
          method: 'GET',
        })

        // Check that errorSignal was cleared
        expect(errorSignal.value).toBe('')

        // Check that the function returns the response data
        expect(result).toEqual(mockResponse)
      },
    )

    it(
      'should send request with bearer token when token is provided',
      async () => {
        const fetchMock = vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ data: 'test' }),
        })
        global.fetch = fetchMock

        const testToken = 'test-token-123'

        await sendNextRequest({
          endpoint: 'https://api.example.com/test',
          method: 'GET',
          token: testToken,
        })

        expect(fetchMock).toHaveBeenCalledWith(
          'https://api.example.com/test',
          expect.objectContaining({
            headers: {
              Authorization: `bearer ${testToken}`,
              'Content-Type': 'application/json',
            },
          }),
        )
      },
    )
  },
)
