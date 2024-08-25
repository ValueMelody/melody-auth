import { expect } from 'vitest'

export const dbTime = expect.stringMatching(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)

export const superAdminRole = {
  id: 1,
  name: 'super_admin',
  note: 'Grants a user full access to the admin panel',
  createdAt: dbTime,
  updatedAt: dbTime,
  deletedAt: null,
}
