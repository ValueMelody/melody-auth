import { userPasskeyModel } from 'models'

export const createUserPasskey = async (
  db: D1Database,
  userId: number,
  credentialId: string,
  publicKey: string,
  counter: number,
) => {
  const isCreated = await userPasskeyModel.create(
    db, {
      userId,
      credentialId,
      publicKey,
      counter,
    },
  )
  return isCreated
}
