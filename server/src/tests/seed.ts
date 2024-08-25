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

export const adminSpaApp = {
  id: 1,
  clientId: expect.any(String),
  secret: expect.any(String),
  type: 'spa',
  isActive: true,
  name: 'Admin Panel (SPA)',
  redirectUris: [
    'http://localhost:3000/en/dashboard',
    'http://localhost:3000/fr/dashboard',
  ],
  createdAt: dbTime,
  updatedAt: dbTime,
  deletedAt: null,
}

export const adminS2sApp = {
  id: 2,
  clientId: expect.any(String),
  secret: expect.any(String),
  type: 's2s',
  isActive: true,
  name: 'Admin Panel (S2S)',
  redirectUris: [],
  createdAt: dbTime,
  updatedAt: dbTime,
  deletedAt: null,
}
