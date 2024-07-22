export const sendNextRequest = async ({
  endpoint,
  method,
  token,
  body,
}: {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT';
  token?: string;
  body?: object;
}) => {
  const res = await fetch(
    endpoint,
    {
      method,
      headers: {
        Authorization: token ? `bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    },
  )
  if (res.ok) {
    const data = await res.json()
    return data
  } else {
    throw new Error('Can not fetch data')
  }
}
