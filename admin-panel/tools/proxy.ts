export const sendNextRequest = async ({
  endpoint,
  method,
  token,
}: {
  endpoint: string;
  method: 'GET';
  token: string;
}) => {
  const res = await fetch(
    endpoint,
    {
      method,
      headers: { Authorization: `bearer ${token}` },
    },
  )
  if (res.ok) {
    const data = await res.json()
    return data
  } else {
    throw new Error('Can not fetch data')
  }
}
