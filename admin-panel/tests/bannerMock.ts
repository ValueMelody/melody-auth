export const banners = [
  {
    id: 1,
    type: 'info',
    text: 'This is an info banner',
    locales: [
      {
        locale: 'en',
        value: 'This is an info banner',
      },
      {
        locale: 'fr',
        value: 'Ceci est une bannière d\'information',
      },
    ],
    appIds: [1, 2],
    isActive: true,
    createdAt: '2024-08-07 20:45:26',
    updatedAt: '2024-10-05 19:38:29',
    deletedAt: null,
  },
  {
    id: 2,
    type: 'warning',
    text: 'This is a warning banner',
    locales: [
      {
        locale: 'en',
        value: 'This is a warning banner',
      },
    ],
    appIds: [1],
    isActive: true,
    createdAt: '2024-08-08 10:15:30',
    updatedAt: '2024-08-08 10:15:30',
    deletedAt: null,
  },
  {
    id: 3,
    type: 'error',
    text: null,
    locales: [
      {
        locale: 'en',
        value: 'This is an error banner',
      },
      {
        locale: 'fr',
        value: 'Ceci est une bannière d\'erreur',
      },
    ],
    appIds: [3, 4],
    isActive: false,
    createdAt: '2024-08-09 14:22:15',
    updatedAt: '2024-09-01 16:45:00',
    deletedAt: null,
  },
  {
    id: 4,
    type: 'success',
    text: 'Operation completed successfully',
    locales: [],
    appIds: [],
    isActive: true,
    createdAt: '2024-08-10 09:30:45',
    updatedAt: '2024-08-10 09:30:45',
    deletedAt: null,
  },
]
