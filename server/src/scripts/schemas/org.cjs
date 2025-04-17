const Org = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    name: { type: 'string' },
    slug: { type: 'string' },
    companyLogoUrl: { type: 'string' },
    companyEmailLogoUrl: { type: 'string' },
    fontFamily: { type: 'string' },
    fontUrl: { type: 'string' },
    layoutColor: { type: 'string' },
    labelColor: { type: 'string' },
    primaryButtonColor: { type: 'string' },
    primaryButtonLabelColor: { type: 'string' },
    primaryButtonBorderColor: { type: 'string' },
    secondaryButtonColor: { type: 'string' },
    secondaryButtonLabelColor: { type: 'string' },
    secondaryButtonBorderColor: { type: 'string' },
    criticalIndicatorColor: { type: 'string' },
    emailSenderName: { type: 'string' },
    termsLink: { type: 'string' },
    privacyPolicyLink: { type: 'string' },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' },
    deletedAt: {
      type: 'string',
      nullable: true,
    },
  },
  required: [
    'id', 'name', 'slug', 'companyLogoUrl', 'companyEmailLogoUrl',
    'fontFamily', 'fontUrl', 'layoutColor', 'labelColor',
    'primaryButtonColor', 'primaryButtonLabelColor', 'primaryButtonBorderColor',
    'secondaryButtonColor', 'secondaryButtonLabelColor', 'secondaryButtonBorderColor',
    'criticalIndicatorColor', 'emailSenderName', 'termsLink', 'privacyPolicyLink',
    'createdAt', 'updatedAt', 'deletedAt',
  ],
}

const PutOrgReq = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 50,
    },
    slug: {
      type: 'string',
      minLength: 1,
      maxLength: 50,
    },
    companyLogoUrl: {
      type: 'string',
      minLength: 0,
      maxLength: 250,
    },
    companyEmailLogoUrl: {
      type: 'string',
      minLength: 0,
      maxLength: 250,
    },
    fontFamily: {
      type: 'string',
      minLength: 0,
      maxLength: 50,
    },
    fontUrl: {
      type: 'string',
      minLength: 0,
      maxLength: 250,
    },
    layoutColor: {
      type: 'string',
      minLength: 0,
      maxLength: 20,
    },
    labelColor: {
      type: 'string',
      minLength: 0,
      maxLength: 20,
    },
    primaryButtonColor: {
      type: 'string',
      minLength: 0,
      maxLength: 20,
    },
    primaryButtonLabelColor: {
      type: 'string',
      minLength: 0,
      maxLength: 20,
    },
    primaryButtonBorderColor: {
      type: 'string',
      minLength: 0,
      maxLength: 20,
    },
    secondaryButtonColor: {
      type: 'string',
      minLength: 0,
      maxLength: 20,
    },
    secondaryButtonLabelColor: {
      type: 'string',
      minLength: 0,
      maxLength: 20,
    },
    secondaryButtonBorderColor: {
      type: 'string',
      minLength: 0,
      maxLength: 20,
    },
    criticalIndicatorColor: {
      type: 'string',
      minLength: 0,
      maxLength: 20,
    },
    emailSenderName: {
      type: 'string',
      minLength: 0,
      maxLength: 20,
    },
    termsLink: {
      type: 'string',
      minLength: 0,
      maxLength: 250,
    },
    privacyPolicyLink: {
      type: 'string',
      minLength: 0,
      maxLength: 250,
    },
  },
}

const PostOrgReq = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 50,
    },
    slug: {
      type: 'string',
      minLength: 1,
      maxLength: 50,
    },
  },
  required: ['name', 'slug'],
}

module.exports = {
  Org, PutOrgReq, PostOrgReq,
}
