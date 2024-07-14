export const getCurrentTimestamp = () => Math.floor(Date.now() / 1000)

export const getDbCurrentTime = () => {
  const date = new Date()

  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(
    2,
    '0',
  )
  const day = String(date.getUTCDate()).padStart(
    2,
    '0',
  )
  const hours = String(date.getUTCHours()).padStart(
    2,
    '0',
  )
  const minutes = String(date.getUTCMinutes()).padStart(
    2,
    '0',
  )
  const seconds = String(date.getUTCSeconds()).padStart(
    2,
    '0',
  )

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}
