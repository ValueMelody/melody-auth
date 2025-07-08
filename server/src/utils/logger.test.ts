import {
  afterEach, beforeEach, describe, expect, test, vi,
} from 'vitest'
import { Context } from 'hono'
import {
  LoggerLevel,
  customLogger,
  triggerLogger,
  infoLogger,
  warnLogger,
  errorLogger,
} from './logger'
import {
  typeConfig, variableConfig,
} from 'configs'

// Mock console methods
const mockConsoleInfo = vi.fn()
const mockConsoleWarn = vi.fn()
const mockConsoleError = vi.fn()

// Store original env values
const originalEnv = process.env

beforeEach(() => {
  vi.clearAllMocks()
  global.console.info = mockConsoleInfo
  global.console.warn = mockConsoleWarn
  global.console.error = mockConsoleError
})

afterEach(() => {
  vi.restoreAllMocks()
  // Restore original environment
  process.env = originalEnv
})

// Helper function to create mock context
const createMockContext = (): Context<typeConfig.Context> => {
  return {} as Context<typeConfig.Context>
}

// Helper function to set up environment variables
const setupEnv = (
  environment: string = 'prod',
  logLevel: string = 'info',
) => {
  process.env.ENVIRONMENT = environment
  process.env.LOG_LEVEL = logLevel
}

describe(
  'LoggerLevel enum',
  () => {
    test(
      'should have correct enum values',
      () => {
        expect(LoggerLevel.Info).toBe('info')
        expect(LoggerLevel.Warn).toBe('warn')
        expect(LoggerLevel.Error).toBe('error')
        expect(LoggerLevel.Silent).toBe('silent')
      },
    )
  },
)

describe(
  'customLogger',
  () => {
    test(
      'should call infoLogger for info level',
      () => {
        customLogger(
          'test message',
          LoggerLevel.Info,
        )

        expect(mockConsoleInfo).toHaveBeenCalledTimes(1)
        expect(mockConsoleInfo).toHaveBeenCalledWith(
          '[info]',
          'test message',
          expect.any(String),
        )
      },
    )

    test(
      'should call warnLogger for warn level',
      () => {
        customLogger(
          'test warning',
          LoggerLevel.Warn,
        )

        expect(mockConsoleWarn).toHaveBeenCalledTimes(1)
        expect(mockConsoleWarn).toHaveBeenCalledWith(
          '[warn]',
          'test warning',
          expect.any(String),
        )
      },
    )

    test(
      'should call errorLogger for error level',
      () => {
        customLogger(
          'test error',
          LoggerLevel.Error,
        )

        expect(mockConsoleError).toHaveBeenCalledTimes(1)
        expect(mockConsoleError).toHaveBeenCalledWith(
          expect.stringContaining('[error]'),
          expect.stringContaining('test error'),
          expect.any(String),
        )
      },
    )

    test(
      'should default to infoLogger when no level provided',
      () => {
        customLogger('test message')

        expect(mockConsoleInfo).toHaveBeenCalledTimes(1)
        expect(mockConsoleInfo).toHaveBeenCalledWith(
          '[info]',
          'test message',
          expect.any(String),
        )
      },
    )

    test(
      'should default to infoLogger for unknown level',
      () => {
        customLogger(
          'test message',
'unknown' as LoggerLevel,
        )

        expect(mockConsoleInfo).toHaveBeenCalledTimes(1)
      },
    )
  },
)

describe(
  'triggerLogger',
  () => {
    describe(
      'Error level logging',
      () => {
        test(
          'should log error when log level is not silent',
          () => {
            setupEnv(
              'prod',
              'info',
            )
            const context = createMockContext()
            triggerLogger(
              context,
              LoggerLevel.Error,
              'error message',
            )

            expect(mockConsoleError).toHaveBeenCalledTimes(1)
          },
        )

        test(
          'should log error in development environment even when log level is silent',
          () => {
            setupEnv(
              'dev',
              'silent',
            )
            const context = createMockContext()
            triggerLogger(
              context,
              LoggerLevel.Error,
              'error message',
            )

            expect(mockConsoleError).toHaveBeenCalledTimes(1)
          },
        )

        test(
          'should not log error when log level is silent in production',
          () => {
            setupEnv(
              'prod',
              'silent',
            )
            const context = createMockContext()
            triggerLogger(
              context,
              LoggerLevel.Error,
              'error message',
            )

            expect(mockConsoleError).not.toHaveBeenCalled()
          },
        )
      },
    )

    describe(
      'Warn level logging',
      () => {
        test(
          'should log warn when log level is info',
          () => {
            setupEnv(
              'prod',
              'info',
            )
            const context = createMockContext()
            triggerLogger(
              context,
              LoggerLevel.Warn,
              'warn message',
            )

            expect(mockConsoleWarn).toHaveBeenCalledTimes(1)
          },
        )

        test(
          'should log warn when log level is warn',
          () => {
            setupEnv(
              'prod',
              'warn',
            )
            const context = createMockContext()
            triggerLogger(
              context,
              LoggerLevel.Warn,
              'warn message',
            )

            expect(mockConsoleWarn).toHaveBeenCalledTimes(1)
          },
        )

        test(
          'should log warn in development environment regardless of log level',
          () => {
            setupEnv(
              'dev',
              'silent',
            )
            const context = createMockContext()
            triggerLogger(
              context,
              LoggerLevel.Warn,
              'warn message',
            )

            expect(mockConsoleWarn).toHaveBeenCalledTimes(1)
          },
        )

        test(
          'should not log warn when log level is error in production',
          () => {
            setupEnv(
              'prod',
              'error',
            )
            const context = createMockContext()
            triggerLogger(
              context,
              LoggerLevel.Warn,
              'warn message',
            )

            expect(mockConsoleWarn).not.toHaveBeenCalled()
          },
        )

        test(
          'should not log warn when log level is silent in production',
          () => {
            setupEnv(
              'prod',
              'silent',
            )
            const context = createMockContext()
            triggerLogger(
              context,
              LoggerLevel.Warn,
              'warn message',
            )

            expect(mockConsoleWarn).not.toHaveBeenCalled()
          },
        )
      },
    )

    describe(
      'Info level logging',
      () => {
        test(
          'should log info when log level is info',
          () => {
            setupEnv(
              'prod',
              'info',
            )
            const context = createMockContext()
            triggerLogger(
              context,
              LoggerLevel.Info,
              'info message',
            )

            expect(mockConsoleInfo).toHaveBeenCalledTimes(1)
          },
        )

        test(
          'should log info in development environment regardless of log level',
          () => {
            setupEnv(
              'dev',
              'silent',
            )
            const context = createMockContext()
            triggerLogger(
              context,
              LoggerLevel.Info,
              'info message',
            )

            expect(mockConsoleInfo).toHaveBeenCalledTimes(1)
          },
        )

        test(
          'should not log info when log level is warn in production',
          () => {
            setupEnv(
              'prod',
              'warn',
            )
            const context = createMockContext()
            triggerLogger(
              context,
              LoggerLevel.Info,
              'info message',
            )

            expect(mockConsoleInfo).not.toHaveBeenCalled()
          },
        )

        test(
          'should not log info when log level is error in production',
          () => {
            setupEnv(
              'prod',
              'error',
            )
            const context = createMockContext()
            triggerLogger(
              context,
              LoggerLevel.Info,
              'info message',
            )

            expect(mockConsoleInfo).not.toHaveBeenCalled()
          },
        )

        test(
          'should not log info when log level is silent in production',
          () => {
            setupEnv(
              'prod',
              'silent',
            )
            const context = createMockContext()
            triggerLogger(
              context,
              LoggerLevel.Info,
              'info message',
            )

            expect(mockConsoleInfo).not.toHaveBeenCalled()
          },
        )
      },
    )

    describe(
      'Environment-specific behavior',
      () => {
        test(
          'should log all levels in development environment',
          () => {
            setupEnv(
              variableConfig.DefaultEnvironment.Development,
              'silent',
            )
            const context = createMockContext()

            triggerLogger(
              context,
              LoggerLevel.Info,
              'info message',
            )
            triggerLogger(
              context,
              LoggerLevel.Warn,
              'warn message',
            )
            triggerLogger(
              context,
              LoggerLevel.Error,
              'error message',
            )

            expect(mockConsoleInfo).toHaveBeenCalledTimes(1)
            expect(mockConsoleWarn).toHaveBeenCalledTimes(1)
            expect(mockConsoleError).toHaveBeenCalledTimes(1)
          },
        )

        test(
          'should respect log levels in production environment',
          () => {
            setupEnv(
              variableConfig.DefaultEnvironment.Production,
              'warn',
            )
            const context = createMockContext()

            triggerLogger(
              context,
              LoggerLevel.Info,
              'info message',
            )
            triggerLogger(
              context,
              LoggerLevel.Warn,
              'warn message',
            )
            triggerLogger(
              context,
              LoggerLevel.Error,
              'error message',
            )

            expect(mockConsoleInfo).not.toHaveBeenCalled()
            expect(mockConsoleWarn).toHaveBeenCalledTimes(1)
            expect(mockConsoleError).toHaveBeenCalledTimes(1)
          },
        )
      },
    )
  },
)

describe(
  'Individual logger functions',
  () => {
    describe(
      'infoLogger',
      () => {
        test(
          'should call console.info with correct format',
          () => {
            const message = 'test info message'
            infoLogger(message)

            expect(mockConsoleInfo).toHaveBeenCalledTimes(1)
            expect(mockConsoleInfo).toHaveBeenCalledWith(
              '[info]',
              message,
              expect.any(String),
            )
          },
        )

        test(
          'should include ISO timestamp',
          () => {
            const message = 'test message'
            infoLogger(message)

            const timestamp = mockConsoleInfo.mock.calls[0][2]
            expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
          },
        )
      },
    )

    describe(
      'warnLogger',
      () => {
        test(
          'should call console.warn with correct format',
          () => {
            const message = 'test warn message'
            warnLogger(message)

            expect(mockConsoleWarn).toHaveBeenCalledTimes(1)
            expect(mockConsoleWarn).toHaveBeenCalledWith(
              '[warn]',
              message,
              expect.any(String),
            )
          },
        )

        test(
          'should include ISO timestamp',
          () => {
            const message = 'test message'
            warnLogger(message)

            const timestamp = mockConsoleWarn.mock.calls[0][2]
            expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
          },
        )
      },
    )

    describe(
      'errorLogger',
      () => {
        test(
          'should call console.error with correct format and red coloring',
          () => {
            const message = 'test error message'
            errorLogger(message)

            expect(mockConsoleError).toHaveBeenCalledTimes(1)
            expect(mockConsoleError).toHaveBeenCalledWith(
              expect.stringContaining('[error]'),
              expect.stringContaining(message),
              expect.any(String),
            )
          },
        )

        test(
          'should apply red color formatting to error level and message',
          () => {
            const message = 'test error message'
            errorLogger(message)

            const [level, coloredMessage] = mockConsoleError.mock.calls[0]

            // Check that red color codes are applied
            expect(level).toContain('\x1b[31m') // red color
            expect(level).toContain('\x1b[0m') // reset color
            expect(coloredMessage).toContain('\x1b[31m') // red color
            expect(coloredMessage).toContain('\x1b[0m') // reset color
          },
        )

        test(
          'should include ISO timestamp',
          () => {
            const message = 'test message'
            errorLogger(message)

            const timestamp = mockConsoleError.mock.calls[0][2]
            expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
          },
        )
      },
    )
  },
)

describe(
  'Integration tests',
  () => {
    test(
      'should work correctly with real timestamp format',
      () => {
        const message = 'integration test message'

        infoLogger(message)
        warnLogger(message)
        errorLogger(message)

        // Check that all loggers were called
        expect(mockConsoleInfo).toHaveBeenCalledTimes(1)
        expect(mockConsoleWarn).toHaveBeenCalledTimes(1)
        expect(mockConsoleError).toHaveBeenCalledTimes(1)

        // Check timestamp format for all calls
        const infoTimestamp = mockConsoleInfo.mock.calls[0][2]
        const warnTimestamp = mockConsoleWarn.mock.calls[0][2]
        const errorTimestamp = mockConsoleError.mock.calls[0][2]

        expect(new Date(infoTimestamp)).toBeInstanceOf(Date)
        expect(new Date(warnTimestamp)).toBeInstanceOf(Date)
        expect(new Date(errorTimestamp)).toBeInstanceOf(Date)
      },
    )

    test(
      'should handle empty messages',
      () => {
        setupEnv(
          'dev',
          'info',
        )
        const context = createMockContext()

        customLogger('')
        triggerLogger(
          context,
          LoggerLevel.Info,
          '',
        )
        infoLogger('')
        warnLogger('')
        errorLogger('')

        expect(mockConsoleInfo).toHaveBeenCalledTimes(3)
        expect(mockConsoleWarn).toHaveBeenCalledTimes(1)
        expect(mockConsoleError).toHaveBeenCalledTimes(1)
      },
    )

    test(
      'should handle special characters in messages',
      () => {
        const specialMessage = 'Message with special chars: !@#$%^&*()_+{}|:"<>?'

        customLogger(
          specialMessage,
          LoggerLevel.Error,
        )

        expect(mockConsoleError).toHaveBeenCalledTimes(1)
        expect(mockConsoleError).toHaveBeenCalledWith(
          expect.stringContaining('[error]'),
          expect.stringContaining(specialMessage),
          expect.any(String),
        )
      },
    )
  },
)
