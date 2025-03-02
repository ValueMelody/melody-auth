import { passkeyService } from 'services'

export const enroll = (enrollOptions: passkeyService.EnrollOptions) => {
  return navigator.credentials.create({
    publicKey: {
      challenge: (window as any).SimpleWebAuthnBrowser.base64URLStringToBuffer(enrollOptions.challenge),
      rp: {
        name: 'Melody Auth Service', id: enrollOptions.rpId,
      },
      user: {
        id: new TextEncoder().encode(String(enrollOptions.userId)),
        name: enrollOptions.userEmail,
        displayName: enrollOptions.userDisplayName,
      },
      pubKeyCredParams: [
        {
          alg: -8, type: 'public-key',
        },
        {
          alg: -7, type: 'public-key',
        },
        {
          alg: -257, type: 'public-key',
        },
      ],
      authenticatorSelection: { userVerification: 'preferred' },
    },
  })
}
