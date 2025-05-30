export const userAttributes = [
  {
    id: 1,
    name: 'firstName',
    includeInSignUpForm: true,
    requiredInSignUpForm: true,
    includeInIdTokenBody: true,
    includeInUserInfo: true,
  },
  {
    id: 2,
    name: 'lastName',
    includeInSignUpForm: true,
    requiredInSignUpForm: false,
    includeInIdTokenBody: false,
    includeInUserInfo: true,
  },
  {
    id: 3,
    name: 'email',
    includeInSignUpForm: false,
    requiredInSignUpForm: false,
    includeInIdTokenBody: true,
    includeInUserInfo: false,
  },
]
