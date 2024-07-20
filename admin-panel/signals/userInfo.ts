import { signal } from '@preact/signals-react'
import { GetUserInfo } from '../../global'

const userInfo = signal<GetUserInfo | null>(null)

export default userInfo
