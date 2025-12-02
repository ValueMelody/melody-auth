import {
  expect, describe, it, vi, beforeEach,
  Mock,
} from 'vitest'
import { render } from 'hono/jsx/dom'
import Main from './Main'
import {
  authCodeExpired, changeEmail, changePassword, consent, emailMfa, managePasskey, manageRecoveryCode, mfaEnroll,
  otpMfa, passkeyEnroll, passwordlessCode, recoveryCodeEnroll, recoveryCodeSignIn, resetMfa, resetPassword,
  signIn, signUp, smsMfa, updateInfo, verifyEmail, switchOrg,
} from './tools/locale'
import { typeConfig } from 'configs'
import * as hooks from 'pages/hooks'

// Mock the hooks module
vi.mock(
  'pages/hooks',
  async (importOriginal) => {
    const actual = await importOriginal() as any
    return {
      ...actual,
      useInitialProps: vi.fn().mockReturnValue({
        initialProps: {
          enableLocaleSelector: true,
          locales: ['en'],
          logoUrl: 'https://example.com/logo.png',
          enableSignUp: true,
          enablePasswordReset: true,
          enablePasswordSignIn: true,
          enablePasswordlessSignIn: false,
          allowPasskey: false,
          enableNames: false,
          namesIsRequired: false,
          termsLink: '',
          privacyPolicyLink: '',
          googleClientId: '',
          facebookClientId: '',
          githubClientId: '',
          appName: 'Test App',
          oidcProviders: [],
        },
      }),
      useLocale: vi.fn().mockReturnValue({
        locale: 'en',
        handleSwitchLocale: vi.fn(),
      }),
      useCurrentView: vi.fn().mockReturnValue({
        view: 'SignIn',
        handleSwitchView: vi.fn(),
      }),
      useSubmitError: vi.fn().mockReturnValue({
        submitError: null,
        handleSubmitError: vi.fn(),
      }),
      useChangeOrgForm: vi.fn().mockReturnValue({
        orgs: [
          {
            slug: 'org1', name: 'Organization 1',
          },
          {
            slug: 'org2', name: 'Organization 2',
          },
        ],
        activeOrgSlug: 'org1',
        getUserOrgsInfo: vi.fn(),
        handleSwitchOrg: vi.fn(),
        isSwitching: false,
        success: false,
        resetSuccess: vi.fn(),
        redirectUri: '',
      }),
      useSwitchOrgForm: vi.fn().mockReturnValue({
        orgs: [
          {
            slug: 'org1', name: 'Organization 1',
          },
          {
            slug: 'org2', name: 'Organization 2',
          },
        ],
        activeOrgSlug: 'org1',
        getUserOrgsInfo: vi.fn(),
        handleSwitchOrg: vi.fn(),
        isSwitching: false,
      }),
      View: {
        SignIn: 'SignIn',
        SignUp: 'SignUp',
        Consent: 'Consent',
        MfaEnroll: 'MfaEnroll',
        OtpSetup: 'OtpSetup',
        OtpMfa: 'OtpMfa',
        SmsMfa: 'SmsMfa',
        EmailMfa: 'EmailMfa',
        PasskeyEnroll: 'PasskeyEnroll',
        RecoveryCodeEnroll: 'RecoveryCodeEnroll',
        RecoveryCodeSignIn: 'RecoveryCodeSignIn',
        ResetPassword: 'ResetPassword',
        UpdateInfo: 'UpdateInfo',
        ChangePassword: 'ChangePassword',
        ResetMfa: 'ResetMfa',
        ManagePasskey: 'ManagePasskey',
        ManageRecoveryCode: 'ManageRecoveryCode',
        ChangeEmail: 'ChangeEmail',
        AuthCodeExpired: 'AuthCodeExpired',
        VerifyEmail: 'VerifyEmail',
        PasswordlessVerify: 'PasswordlessVerify',
        SwitchOrg: 'SwitchOrg',
        ChangeOrg: 'ChangeOrg',
      },
    }
  },
)

describe(
  'App Component',
  () => {
    const mockHandleSwitchLocale = vi.fn()
    const mockHandleSwitchView = vi.fn()
    const mockHandleSubmitError = vi.fn()
    const mockGetUserOrgsInfo = vi.fn()
    const mockHandleSwitchOrg = vi.fn()
    const mockResetSuccess = vi.fn()

    const mockInitialProps = {
      enableLocaleSelector: true,
      locales: ['en' as typeConfig.Locale],
      logoUrl: 'https://example.com/logo.png',
      enableSignUp: true,
      enablePasswordReset: true,
      enablePasswordSignIn: true,
      enablePasswordlessSignIn: false,
      allowPasskey: false,
      enableNames: false,
      namesIsRequired: false,
      termsLink: '',
      privacyPolicyLink: '',
      googleClientId: '',
      facebookClientId: '',
      githubClientId: '',
      appName: 'Test App',
      oidcProviders: [],
    }

    const mockChangeOrgForm = {
      orgs: [
        {
          slug: 'org1', name: 'Organization 1',
        },
        {
          slug: 'org2', name: 'Organization 2',
        },
      ],
      activeOrgSlug: 'org1',
      getUserOrgsInfo: mockGetUserOrgsInfo,
      handleSwitchOrg: mockHandleSwitchOrg,
      isSwitching: false,
      success: false,
      resetSuccess: mockResetSuccess,
      redirectUri: '',
    }

    const mockSwitchOrgForm = {
      orgs: [
        {
          slug: 'org1', name: 'Organization 1',
        },
        {
          slug: 'org2', name: 'Organization 2',
        },
      ],
      activeOrgSlug: 'org1',
      getUserOrgsInfo: mockGetUserOrgsInfo,
      handleSwitchOrg: mockHandleSwitchOrg,
      isSwitching: false,
    }

    beforeEach(() => {
      vi.clearAllMocks();

      // Override the mock implementations for each test
      (hooks.useInitialProps as Mock).mockReturnValue({ initialProps: mockInitialProps });
      (hooks.useLocale as Mock).mockReturnValue({
        locale: 'en' as typeConfig.Locale,
        handleSwitchLocale: mockHandleSwitchLocale,
      });
      (hooks.useCurrentView as Mock).mockReturnValue({
        view: hooks.View.SignIn,
        handleSwitchView: mockHandleSwitchView,
      });
      (hooks.useSubmitError as Mock).mockReturnValue({
        submitError: null,
        handleSubmitError: mockHandleSubmitError,
      });
      (hooks.useChangeOrgForm as Mock).mockReturnValue(mockChangeOrgForm);
      (hooks.useSwitchOrgForm as Mock).mockReturnValue(mockSwitchOrgForm)

      document.body.innerHTML = '<div id="root"></div>'
    })

    it(
      'renders Layout with correct props',
      () => {
        const container = document.getElementById('root')!
        render(
          <Main />,
          container,
        )

        const layout = container.firstElementChild
        expect(layout).toBeDefined()
        expect(layout?.className).toContain('layout')
      },
    )

    it(
      'renders SignIn view by default',
      () => {
        const container = document.getElementById('root')!
        render(
          <Main />,
          container,
        )

        expect(container.innerHTML).toContain(signIn.submit.en)
      },
    )

    it(
      'renders SignUp view',
      () => {
        (hooks.useCurrentView as Mock).mockReturnValue({
          view: hooks.View.SignUp,
          handleSwitchView: mockHandleSwitchView,
        })

        const container = document.getElementById('root')!
        render(
          <Main />,
          container,
        )

        expect(container.innerHTML).toContain(signUp.confirmPassword.en)
      },
    )

    it(
      'renders Consent view',
      () => {
        (hooks.useCurrentView as Mock).mockReturnValue({
          view: hooks.View.Consent,
          handleSwitchView: mockHandleSwitchView,
        })

        const container = document.getElementById('root')!
        render(
          <Main />,
          container,
        )

        expect(container.innerHTML).toContain(consent.title.en)
      },
    )

    it(
      'renders MfaEnroll view',
      () => {
        (hooks.useCurrentView as Mock).mockReturnValue({
          view: hooks.View.MfaEnroll,
          handleSwitchView: mockHandleSwitchView,
        })

        const container = document.getElementById('root')!
        render(
          <Main />,
          container,
        )

        expect(container.innerHTML).toContain(mfaEnroll.title.en)
      },
    )

    it(
      'renders ResetPassword view',
      () => {
        (hooks.useCurrentView as Mock).mockReturnValue({
          view: hooks.View.ResetPassword,
          handleSwitchView: mockHandleSwitchView,
        })

        const container = document.getElementById('root')!
        render(
          <Main />,
          container,
        )

        expect(container.innerHTML).toContain(resetPassword.title.en)
      },
    )

    it(
      'renders ChangePassword view',
      () => {
        (hooks.useCurrentView as Mock).mockReturnValue({
          view: hooks.View.ChangePassword,
          handleSwitchView: mockHandleSwitchView,
        })

        const container = document.getElementById('root')!
        render(
          <Main />,
          container,
        )

        expect(container.innerHTML).toContain(changePassword.title.en)
      },
    )

    it(
      'renders ResetMfa view',
      () => {
        (hooks.useCurrentView as Mock).mockReturnValue({
          view: hooks.View.ResetMfa,
          handleSwitchView: mockHandleSwitchView,
        })

        const container = document.getElementById('root')!
        render(
          <Main />,
          container,
        )

        expect(container.innerHTML).toContain(resetMfa.title.en)
      },
    )

    it(
      'renders ManagePasskey view',
      () => {
        (hooks.useCurrentView as Mock).mockReturnValue({
          view: hooks.View.ManagePasskey,
          handleSwitchView: mockHandleSwitchView,
        })

        const container = document.getElementById('root')!
        render(
          <Main />,
          container,
        )

        expect(container.innerHTML).toContain(managePasskey.title.en)
      },
    )

    it(
      'renders ManageRecoveryCode view',
      () => {
        (hooks.useCurrentView as Mock).mockReturnValue({
          view: hooks.View.ManageRecoveryCode,
          handleSwitchView: mockHandleSwitchView,
        })

        const container = document.getElementById('root')!
        render(
          <Main />,
          container,
        )

        expect(container.innerHTML).toContain(manageRecoveryCode.title.en)
      },
    )

    it(
      'renders ChangeEmail view',
      () => {
        (hooks.useCurrentView as Mock).mockReturnValue({
          view: hooks.View.ChangeEmail,
          handleSwitchView: mockHandleSwitchView,
        })

        const container = document.getElementById('root')!
        render(
          <Main />,
          container,
        )

        expect(container.innerHTML).toContain(changeEmail.title.en)
      },
    )

    it(
      'renders PasswordlessVerify view',
      () => {
        (hooks.useCurrentView as Mock).mockReturnValue({
          view: hooks.View.PasswordlessVerify,
          handleSwitchView: mockHandleSwitchView,
        })

        const container = document.getElementById('root')!
        render(
          <Main />,
          container,
        )

        expect(container.innerHTML).toContain(passwordlessCode.title.en)
      },
    )

    it(
      'renders OtpSetup view',
      () => {
        (hooks.useCurrentView as Mock).mockReturnValue({
          view: hooks.View.OtpSetup,
          handleSwitchView: mockHandleSwitchView,
        })

        const container = document.getElementById('root')!
        render(
          <Main />,
          container,
        )

        expect(container.innerHTML).toContain(otpMfa.verify.en)
      },
    )

    it(
      'renders OtpMfa view',
      () => {
        (hooks.useCurrentView as Mock).mockReturnValue({
          view: hooks.View.OtpMfa,
          handleSwitchView: mockHandleSwitchView,
        })

        const container = document.getElementById('root')!
        render(
          <Main />,
          container,
        )

        expect(container.innerHTML).toContain(otpMfa.code.en)
      },
    )

    it(
      'renders SmsMfa view',
      () => {
        (hooks.useCurrentView as Mock).mockReturnValue({
          view: hooks.View.SmsMfa,
          handleSwitchView: mockHandleSwitchView,
        })

        const container = document.getElementById('root')!
        render(
          <Main />,
          container,
        )

        expect(container.innerHTML).toContain(smsMfa.title.en)
      },
    )

    it(
      'renders EmailMfa view',
      () => {
        (hooks.useCurrentView as Mock).mockReturnValue({
          view: hooks.View.EmailMfa,
          handleSwitchView: mockHandleSwitchView,
        })

        const container = document.getElementById('root')!
        render(
          <Main />,
          container,
        )

        expect(container.innerHTML).toContain(emailMfa.title.en)
      },
    )

    it(
      'renders PasskeyEnroll view',
      () => {
        (hooks.useCurrentView as Mock).mockReturnValue({
          view: hooks.View.PasskeyEnroll,
          handleSwitchView: mockHandleSwitchView,
        })

        const container = document.getElementById('root')!
        render(
          <Main />,
          container,
        )

        expect(container.innerHTML).toContain(passkeyEnroll.title.en)
      },
    )

    it(
      'renders AuthCodeExpired view',
      () => {
        (hooks.useCurrentView as Mock).mockReturnValue({
          view: hooks.View.AuthCodeExpired,
          handleSwitchView: mockHandleSwitchView,
        })

        const container = document.getElementById('root')!
        render(
          <Main />,
          container,
        )

        expect(container.innerHTML).toContain(authCodeExpired.msg.en)
      },
    )

    it(
      'renders VerifyEmail view',
      () => {
        (hooks.useCurrentView as Mock).mockReturnValue({
          view: hooks.View.VerifyEmail,
          handleSwitchView: mockHandleSwitchView,
        })

        const container = document.getElementById('root')!
        render(
          <Main />,
          container,
        )

        expect(container.innerHTML).toContain(verifyEmail.title.en)
      },
    )

    it(
      'renders UpdateInfo view',
      () => {
        (hooks.useCurrentView as Mock).mockReturnValue({
          view: hooks.View.UpdateInfo,
          handleSwitchView: mockHandleSwitchView,
        })

        const container = document.getElementById('root')!
        render(
          <Main />,
          container,
        )

        expect(container.innerHTML).toContain(updateInfo.title.en)
      },
    )

    it(
      'renders RecoveryCodeEnroll view',
      () => {
        (hooks.useCurrentView as Mock).mockReturnValue({
          view: hooks.View.RecoveryCodeEnroll,
          handleSwitchView: mockHandleSwitchView,
        })

        const container = document.getElementById('root')!
        render(
          <Main />,
          container,
        )

        expect(container.innerHTML).toContain(recoveryCodeEnroll.title.en)
      },
    )

    it(
      'renders RecoveryCodeSignIn view',
      () => {
        (hooks.useCurrentView as Mock).mockReturnValue({
          view: hooks.View.RecoveryCodeSignIn,
          handleSwitchView: mockHandleSwitchView,
        })

        const container = document.getElementById('root')!
        render(
          <Main />,
          container,
        )

        expect(container.innerHTML).toContain(recoveryCodeSignIn.title.en)
      },
    )

    it(
      'renders ChangeOrg view',
      () => {
        (hooks.useCurrentView as Mock).mockReturnValue({
          view: hooks.View.ChangeOrg,
          handleSwitchView: mockHandleSwitchView,
        })

        const container = document.getElementById('root')!
        render(
          <Main />,
          container,
        )

        expect(container.innerHTML).toContain(switchOrg.title.en)
      },
    )

    it(
      'renders SwitchOrg view',
      () => {
        (hooks.useCurrentView as Mock).mockReturnValue({
          view: hooks.View.SwitchOrg,
          handleSwitchView: mockHandleSwitchView,
        })

        const container = document.getElementById('root')!
        render(
          <Main />,
          container,
        )

        expect(container.innerHTML).toContain(switchOrg.title.en)
      },
    )

    it(
      'shows locale selector when enabled',
      () => {
        const container = document.getElementById('root')!
        render(
          <Main />,
          container,
        )

        const localeSelector = container.querySelector('.locale-selector')
        expect(localeSelector).toBeDefined()
      },
    )

    it(
      'hides locale selector when disabled',
      () => {
        (hooks.useInitialProps as Mock).mockReturnValue({
          initialProps: {
            ...mockInitialProps,
            enableLocaleSelector: false,
            locales: ['en' as typeConfig.Locale],
          },
        })

        const container = document.getElementById('root')!
        render(
          <Main />,
          container,
        )

        const localeSelector = container.querySelector('.locale-selector')
        expect(localeSelector).toBeNull()
      },
    )

    it(
      'displays logo when logoUrl is provided',
      () => {
        const container = document.getElementById('root')!
        render(
          <Main />,
          container,
        )

        const logo = container.querySelector(`img[src="${mockInitialProps.logoUrl}"]`)
        expect(logo).toBeDefined()
      },
    )
  },
)
