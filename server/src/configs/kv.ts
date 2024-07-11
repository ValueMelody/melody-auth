export enum BaseKey {
  RefreshToken = 'refreshToken',
}

export const getKey = (
  base: BaseKey, id: string,
): string => {
  return `${base}-${id}`
}
