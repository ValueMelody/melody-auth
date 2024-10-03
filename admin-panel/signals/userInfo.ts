import { signal } from '@preact/signals-react'
import { GetUserInfoRes } from 'shared'

const userInfo = signal<GetUserInfoRes | null>(null)

export default userInfo
