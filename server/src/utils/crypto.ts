export const encryptPassword = async (password: string) => {
  const content = new TextEncoder().encode(password)
  const digest = await crypto.subtle.digest(
    { name: 'SHA-256' },
    content,
  )
  const hashArray = Array.from(new Uint8Array(digest))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(
    2,
    '0',
  )).join('')
  return hashHex
}
