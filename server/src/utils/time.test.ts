import {
  describe, expect, test, vi,
} from 'vitest'
import { isUtcString } from './time'

describe(
  'isUtcString',
  () => {
    describe(
      'should return false for invalid inputs',
      () => {
        test(
          'should return false for undefined',
          () => {
            expect(isUtcString(undefined)).toBe(false)
          },
        )

        test(
          'should return false for null',
          () => {
            expect(isUtcString(null as any)).toBe(false)
          },
        )

        test(
          'should return false for number',
          () => {
            expect(isUtcString(123 as any)).toBe(false)
          },
        )

        test(
          'should return false for object',
          () => {
            expect(isUtcString({} as any)).toBe(false)
          },
        )

        test(
          'should return false for array',
          () => {
            expect(isUtcString([] as any)).toBe(false)
          },
        )

        test(
          'should return false for boolean',
          () => {
            expect(isUtcString(true as any)).toBe(false)
          },
        )
      },
    )

    describe(
      'should return false for invalid date strings',
      () => {
        test(
          'should return false for empty string',
          () => {
            expect(isUtcString('')).toBe(false)
          },
        )

        test(
          'should return false for invalid date format',
          () => {
            expect(isUtcString('not a date')).toBe(false)
          },
        )

        test(
          'should return false for invalid dates',
          () => {
            const invalidDates = [
              'abc-def-ghi',
            ]

            invalidDates.forEach((date) => {
              expect(isUtcString(date)).toBe(false)
            })
          },
        )
      },
    )
  },
)
