export const stripEndingSlash = (val: string) => {
  return val.replace(
    /\/$/,
    '',
  )
}
