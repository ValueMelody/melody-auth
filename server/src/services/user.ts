import { Context } from 'hono'
import { env } from 'hono/adapter'
import { GetUserInfoRes } from '@melody-auth/shared'
import {
  errorConfig,
  messageConfig,
  typeConfig,
  variableConfig,
} from 'configs'
import {
  baseDto, identityDto, userDto,
} from 'dtos'
import {
  orgModel, roleModel, userAppConsentModel, userAttributeModel, userAttributeValueModel,
  userModel, userOrgGroupModel, userRoleModel,
} from 'models'
import {
  emailService, jwtService, kvService, roleService,
} from 'services'
import {
  cryptoUtil, loggerUtil, requestUtil, timeUtil,
} from 'utils'

export const getUserInfo = async (
  c: Context<typeConfig.Context>, authId: string,
): Promise<GetUserInfoRes> => {
  const user = await userModel.getByAuthId(
    c.env.DB,
    authId,
  )
  if (!user) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.NoUser,
    )
    throw new errorConfig.NotFound(messageConfig.RequestError.NoUser)
  }
  if (!user.isActive) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.UserDisabled,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.UserDisabled)
  }

  const {
    ENABLE_USER_ATTRIBUTE: enableUserAttribute,
    ENABLE_NAMES: enableNames,
  } = env(c)

  let attributes: Record<string, string> | undefined
  if (enableUserAttribute) {
    attributes = {}
    const userAttributes = await userAttributeModel.getAll(c.env.DB)
    const userAttributeValues = await userAttributeValueModel.getAllByUserId(
      c.env.DB,
      user.id,
    )
    for (const userAttributeValue of userAttributeValues) {
      const userAttribute = userAttributes.find((attribute) => attribute.id === userAttributeValue.userAttributeId)
      if (userAttribute?.includeInUserInfo) {
        attributes[userAttribute.name] = userAttributeValue.value
      }
    }
  }

  const roles = await roleService.getUserRoles(
    c,
    user.id,
  )

  const linkedUser = user.linkedAuthId
    ? await userModel.getByAuthId(
      c.env.DB,
      user.linkedAuthId,
    )
    : null
  const linkedUserRoles = linkedUser
    ? await roleService.getUserRoles(
      c,
      linkedUser.id,
    )
    : []

  const result: GetUserInfoRes = {
    authId: user.authId,
    email: user.email,
    locale: user.locale,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    emailVerified: !!user.emailVerified,
    linkedAccount: linkedUser
      ? {
        authId: linkedUser.authId,
        email: linkedUser.email,
        locale: linkedUser.locale,
        createdAt: linkedUser.createdAt,
        updatedAt: linkedUser.updatedAt,
        emailVerified: !!linkedUser.emailVerified,
        roles: linkedUserRoles,
      }
      : null,
    roles,
    attributes,
  }

  if (enableNames) {
    result.firstName = user.firstName
    result.lastName = user.lastName
    if (result.linkedAccount && linkedUser) {
      result.linkedAccount.firstName = linkedUser.firstName
      result.linkedAccount.lastName = linkedUser.lastName
    }
  }

  return result
}

export const getUsers = async (
  c: Context<typeConfig.Context>,
  search: string | undefined,
  pagination: typeConfig.Pagination | undefined,
  orgId: number | undefined,
): Promise<userModel.PaginatedApiRecords> => {
  let org: orgModel.Record | null = null
  if (orgId) {
    org = await orgModel.getById(
      c.env.DB,
      orgId,
    )
    if (!org) {
      loggerUtil.triggerLogger(
        c,
        loggerUtil.LoggerLevel.Warn,
        messageConfig.RequestError.NoOrg,
      )
      throw new errorConfig.NotFound(messageConfig.RequestError.NoOrg)
    }
  }

  const searchObj = search
    ? {
      column: "(COALESCE(\"firstName\", '') || ' ' || COALESCE(\"lastName\", '') || ' ' || COALESCE(\"email\", ''))",
      value: `%${search}%`,
    }
    : undefined

  const users = await userModel.getAll(
    c.env.DB,
    {
      search: searchObj,
      match: org
        ? {
          column: 'orgSlug',
          value: org.slug,
        }
        : undefined,
      pagination,
    },
  )
  const count = pagination
    ? await userModel.count(
      c.env.DB,
      {
        search: searchObj,
        match: org
          ? {
            column: 'orgSlug',
            value: org.slug,
          }
          : undefined,
      },
    )
    : users.length

  const { ENABLE_NAMES: enableNames } = env(c)

  const result = users.map((user) => userModel.convertToApiRecord(
    user,
    enableNames,
  ))
  return {
    users: result, count,
  }
}

export const getUserByAuthId = async (
  c: Context<typeConfig.Context>,
  authId: string,
): Promise<userModel.Record> => {
  const user = await userModel.getByAuthId(
    c.env.DB,
    authId,
  )
  if (!user) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.NoUser,
    )
    throw new errorConfig.NotFound(messageConfig.RequestError.NoUser)
  }
  return user
}

export const getUserDetailByAuthId = async (
  c: Context<typeConfig.Context>,
  authId: string,
): Promise<userModel.ApiRecordFull> => {
  const user = await userModel.getByAuthId(
    c.env.DB,
    authId,
  )
  if (!user) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.NoUser,
    )
    throw new errorConfig.NotFound(messageConfig.RequestError.NoUser)
  }

  const {
    ENABLE_NAMES: enableNames, ENABLE_ORG: enableOrg,
  } = env(c)

  const roles = await roleService.getUserRoles(
    c,
    user.id,
  )

  const org = user.orgSlug
    ? await orgModel.getBySlug(
      c.env.DB,
      user.orgSlug,
    )
    : undefined

  const orgGroups = org
    ? await userOrgGroupModel.getAllByUser(
      c.env.DB,
      user.id,
    )
    : []

  const { ENABLE_USER_ATTRIBUTE: enableUserAttribute } = env(c)
  let attributes: Record<string, string> | undefined
  if (enableUserAttribute) {
    attributes = {}
    const userAttributes = await userAttributeModel.getAll(c.env.DB)
    const userAttributeValues = await userAttributeValueModel.getAllByUserId(
      c.env.DB,
      user.id,
    )
    for (const userAttributeValue of userAttributeValues) {
      const userAttribute = userAttributes.find((attribute) => attribute.id === userAttributeValue.userAttributeId)
      if (userAttribute) {
        attributes[userAttribute.name] = userAttributeValue.value
      }
    }
  }

  const result = userModel.convertToApiRecordFull(
    user,
    enableNames,
    enableOrg,
    roles,
    org,
    orgGroups,
    attributes,
  )
  return result
}

export const getPasswordlessUserOrCreate = async (
  c: Context<typeConfig.Context>,
  bodyDto: identityDto.PostAuthorizeWithPasswordlessDto,
): Promise<userModel.Record> => {
  const user = await userModel.getNormalUserByEmail(
    c.env.DB,
    bodyDto.email,
  )

  if (user) {
    if (!user.isActive) {
      loggerUtil.triggerLogger(
        c,
        loggerUtil.LoggerLevel.Warn,
        messageConfig.RequestError.UserDisabled,
      )
      throw new errorConfig.Forbidden(messageConfig.RequestError.UserDisabled)
    } else {
      return user
    }
  }

  const org = bodyDto.org
    ? await orgModel.getBySlug(
      c.env.DB,
      bodyDto.org,
    )
    : null

  const newUser = await userModel.create(
    c.env.DB,
    {
      authId: crypto.randomUUID(),
      orgSlug: org?.slug ?? '',
      email: bodyDto.email,
      socialAccountId: null,
      socialAccountType: null,
      password: null,
      locale: bodyDto.locale,
      otpSecret: cryptoUtil.genOtpSecret(),
      firstName: null,
      lastName: null,
    },
  )

  return newUser
}

export const verifySignIn = async (
  c: Context<typeConfig.Context>,
  email: string,
  isValidCredential: (currentUser: userModel.Record) => boolean,
): Promise<userModel.Record> => {
  const {
    ACCOUNT_LOCKOUT_THRESHOLD: lockThreshold, ACCOUNT_LOCKOUT_EXPIRES_IN: lockExpiresIn,
  } = env(c)

  const ip = requestUtil.getRequestIP(c)

  const failedAttempts = lockThreshold
    ? await kvService.getFailedLoginAttemptsByIP(
      c.env.KV,
      email,
      ip,
    )
    : 0
  if (lockThreshold && (failedAttempts >= lockThreshold)) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.AccountLocked,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.AccountLocked)
  }

  const user = await userModel.getNormalUserByEmail(
    c.env.DB,
    email,
  )

  if (!user) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.NoUser,
    )
    throw new errorConfig.NotFound(messageConfig.RequestError.NoUser)
  }

  const isValid = isValidCredential(user)

  if (!isValid) {
    if (lockThreshold) {
      await kvService.setFailedLoginAttempts(
        c.env.KV,
        email,
        ip,
        failedAttempts + 1,
        lockExpiresIn,
      )
    }
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.NoUser,
    )
    throw new errorConfig.NotFound(messageConfig.RequestError.NoUser)
  }

  if (!user.isActive) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.UserDisabled,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.UserDisabled)
  }
  return user
}

export const verifyPasswordSignIn = async (
  c: Context<typeConfig.Context>,
  bodyDto: baseDto.SignInDto,
): Promise<userModel.Record> => {
  const user = await verifySignIn(
    c,
    bodyDto.email,
    (currentUser) => {
      return !!currentUser.password && cryptoUtil.bcryptCompare(
        bodyDto.password,
        currentUser.password,
      )
    },
  )

  return user
}

export const verifyRecoveryCodeSignIn = async (
  c: Context<typeConfig.Context>,
  bodyDto: baseDto.SignInWithRecoveryCodeDto,
): Promise<userModel.Record> => {
  const user = await verifySignIn(
    c,
    bodyDto.email,
    (currentUser) => {
      return !!currentUser.recoveryCodeHash && cryptoUtil.bcryptCompare(
        bodyDto.recoveryCode,
        currentUser.recoveryCodeHash,
      )
    },
  )

  return user
}

interface CreateAccountBody {
  email: string;
  password: string;
  firstName: string | null;
  lastName: string | null;
  locale: typeConfig.Locale;
  org?: string;
}
export const createAccountWithPassword = async (
  c: Context<typeConfig.Context>,
  bodyDto: CreateAccountBody,
  attributeValues: Record<number, string>,
): Promise<userModel.Record> => {
  const user = await userModel.getNormalUserByEmail(
    c.env.DB,
    bodyDto.email,
  )

  if (user) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.EmailTaken,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.EmailTaken)
  }

  const org = bodyDto.org
    ? await orgModel.getBySlug(
      c.env.DB,
      bodyDto.org,
    )
    : null

  const password = await cryptoUtil.bcryptText(bodyDto.password)

  const newUser = await userModel.create(
    c.env.DB,
    {
      authId: crypto.randomUUID(),
      orgSlug: org && org.allowPublicRegistration && !org.onlyUseForBrandingOverride ? org.slug : '',
      email: bodyDto.email,
      socialAccountId: null,
      socialAccountType: null,
      password,
      locale: bodyDto.locale,
      otpSecret: cryptoUtil.genOtpSecret(),
      firstName: bodyDto.firstName,
      lastName: bodyDto.lastName,
    },
  )

  for (const [userAttributeId, value] of Object.entries(attributeValues)) {
    await userAttributeValueModel.create(
      c.env.DB,
      {
        userId: newUser.id, userAttributeId: Number(userAttributeId), value,
      },
    )
  }

  return newUser
}

export const processGoogleAccount = async (
  c: Context<typeConfig.Context>,
  googleUser: jwtService.GoogleUser,
  locale: typeConfig.Locale,
  org?: string,
) => {
  const currentUser = await userModel.getGoogleUserByGoogleId(
    c.env.DB,
    googleUser.id,
  )
  if (currentUser && !currentUser.isActive) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.UserDisabled,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.UserDisabled)
  }

  const user = currentUser ?? await userModel.create(
    c.env.DB,
    {
      authId: crypto.randomUUID(),
      email: googleUser.email,
      orgSlug: org ?? '',
      socialAccountId: googleUser.id,
      socialAccountType: userModel.SocialAccountType.Google,
      password: null,
      locale,
      emailVerified: googleUser.emailVerified ? 1 : 0,
      firstName: googleUser.firstName,
      lastName: googleUser.lastName,
    },
  )
  if (user.emailVerified !== googleUser.emailVerified) {
    await userModel.update(
      c.env.DB,
      user.id,
      { emailVerified: googleUser.emailVerified ? 1 : 0 },
    )
  }
  return user
}

export const processFacebookAccount = async (
  c: Context<typeConfig.Context>,
  facebookUser: jwtService.FacebookUser,
  locale: typeConfig.Locale,
  org?: string,
) => {
  const currentUser = await userModel.getFacebookUserByFacebookId(
    c.env.DB,
    facebookUser.id,
  )
  if (currentUser && !currentUser.isActive) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.UserDisabled,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.UserDisabled)
  }

  const user = currentUser ?? await userModel.create(
    c.env.DB,
    {
      authId: crypto.randomUUID(),
      email: null,
      orgSlug: org ?? '',
      socialAccountId: facebookUser.id,
      socialAccountType: userModel.SocialAccountType.Facebook,
      password: null,
      locale,
      emailVerified: 0,
      firstName: facebookUser.firstName,
      lastName: facebookUser.lastName,
    },
  )
  return user
}

export const processGithubAccount = async (
  c: Context<typeConfig.Context>,
  githubUser: jwtService.GithubUser,
  locale: typeConfig.Locale,
  org?: string,
) => {
  const currentUser = await userModel.getGithubUserByGithubId(
    c.env.DB,
    githubUser.id,
  )
  if (currentUser && !currentUser.isActive) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.UserDisabled,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.UserDisabled)
  }

  const user = currentUser ?? await userModel.create(
    c.env.DB,
    {
      authId: crypto.randomUUID(),
      orgSlug: org ?? '',
      email: githubUser.email,
      socialAccountId: githubUser.id,
      socialAccountType: userModel.SocialAccountType.GitHub,
      password: null,
      locale,
      emailVerified: 0,
      firstName: githubUser.firstName,
      lastName: githubUser.lastName,
    },
  )
  return user
}

export const processDiscordAccount = async (
  c: Context<typeConfig.Context>,
  discordUser: jwtService.DiscordUser,
  locale: typeConfig.Locale,
  org?: string,
) => {
  const currentUser = await userModel.getDiscordUserByDiscordId(
    c.env.DB,
    discordUser.id,
  )
  if (currentUser && !currentUser.isActive) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.UserDisabled,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.UserDisabled)
  }

  const user = currentUser ?? await userModel.create(
    c.env.DB,
    {
      authId: crypto.randomUUID(),
      orgSlug: org ?? '',
      email: discordUser.email,
      socialAccountId: discordUser.id,
      socialAccountType: userModel.SocialAccountType.Discord,
      password: null,
      locale,
      emailVerified: discordUser.emailVerified ? 1 : 0,
      firstName: discordUser.firstName,
      lastName: discordUser.lastName,
    },
  )
  return user
}

export const processAppleAccount = async (
  c: Context<typeConfig.Context>,
  appleUser: jwtService.AppleUser,
  locale: typeConfig.Locale,
  org?: string,
) => {
  const currentUser = await userModel.getAppleUserByAppleId(
    c.env.DB,
    appleUser.id,
  )
  if (currentUser && !currentUser.isActive) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.UserDisabled,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.UserDisabled)
  }

  const user = currentUser ?? await userModel.create(
    c.env.DB,
    {
      authId: crypto.randomUUID(),
      orgSlug: org ?? '',
      email: appleUser.email,
      socialAccountId: appleUser.id,
      socialAccountType: userModel.SocialAccountType.Apple,
      password: null,
      locale,
      emailVerified: 0,
      firstName: null,
      lastName: null,
    },
  )
  return user
}

export const processOidcAccount = async (
  c: Context<typeConfig.Context>,
  oidcUser: jwtService.OidcUser,
  provider: string,
  locale: typeConfig.Locale,
  org?: string,
) => {
  const currentUser = await userModel.getOidcUserById(
    c.env.DB,
    oidcUser.id,
    provider,
  )
  if (currentUser && !currentUser.isActive) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.UserDisabled,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.UserDisabled)
  }

  const user = currentUser ?? await userModel.create(
    c.env.DB,
    {
      authId: crypto.randomUUID(),
      orgSlug: org ?? '',
      email: null,
      socialAccountId: oidcUser.id,
      socialAccountType: provider as userModel.SocialAccountType,
      password: null,
      locale,
      emailVerified: 0,
      firstName: null,
      lastName: null,
    },
  )
  return user
}

export interface SamlUser {
  userId: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
}

export const processSamlAccount = async (
  c: Context<typeConfig.Context>,
  samlUser: SamlUser,
  idpName: string,
  locale: typeConfig.Locale,
  org?: string,
) => {
  const currentUser = await userModel.getSamlUserById(
    c.env.DB,
    samlUser.userId,
    idpName,
  )
  if (currentUser && !currentUser.isActive) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.UserDisabled,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.UserDisabled)
  }

  const user = currentUser ?? await userModel.create(
    c.env.DB,
    {
      authId: crypto.randomUUID(),
      orgSlug: org ?? '',
      email: samlUser.email,
      socialAccountId: samlUser.userId,
      socialAccountType: `SAML_${idpName}` as userModel.SocialAccountType,
      password: null,
      locale,
      emailVerified: 0,
      firstName: samlUser.firstName,
      lastName: samlUser.lastName,
    },
  )
  return user
}

export const verifyUserEmail = async (
  c: Context<typeConfig.Context>,
  bodyDto: identityDto.PostVerifyEmailDto,
): Promise<true> => {
  const user = await userModel.getByAuthId(
    c.env.DB,
    bodyDto.id,
  )
  if (!user || user.emailVerified) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.NoUser,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.NoUser)
  }
  if (!user.isActive) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.UserDisabled,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.UserDisabled)
  }

  const isValid = await kvService.verifyEmailVerificationCode(
    c.env.KV,
    user.id,
    bodyDto.code,
  )
  if (!isValid) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.WrongEmailVerificationCode,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.WrongCode)
  }

  await userModel.update(
    c.env.DB,
    user.id,
    { emailVerified: 1 },
  )

  return true
}

export const sendPasswordReset = async (
  c: Context<typeConfig.Context>,
  email: string,
  locale: typeConfig.Locale,
): Promise<true> => {
  const user = await userModel.getNormalUserByEmail(
    c.env.DB,
    email,
  )
  if (!user || !user.isActive) return true

  const resetCode = await emailService.sendPasswordReset(
    c,
    email,
    user.orgSlug,
    locale,
  )

  if (resetCode) {
    await kvService.storePasswordResetCode(
      c.env.KV,
      user.id,
      resetCode,
    )
  }

  return true
}

export const resetUserPassword = async (
  c: Context<typeConfig.Context>,
  bodyDto: identityDto.PostResetPasswordDto,
): Promise<true> => {
  const user = await userModel.getNormalUserByEmail(
    c.env.DB,
    bodyDto.email,
  )
  if (!user || !user.password) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.NoUser,
    )
    throw new errorConfig.NotFound(messageConfig.RequestError.NoUser)
  }
  if (!user.isActive) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.UserDisabled,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.UserDisabled)
  }

  const isValid = await kvService.verifyPasswordResetCode(
    c.env.KV,
    user.id,
    bodyDto.code,
  )

  if (!isValid) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.WrongPasswordResetCode,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.WrongCode)
  }

  const isSame = cryptoUtil.bcryptCompare(
    bodyDto.password,
    user.password,
  )
  if (isSame) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.RequireDifferentPassword,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.RequireDifferentPassword)
  }

  const password = await cryptoUtil.bcryptText(bodyDto.password)

  await userModel.update(
    c.env.DB,
    user.id,
    { password },
  )

  await kvService.deletePasswordResetCode(
    c.env.KV,
    user.id,
  )

  return true
}

export const changeUserPassword = async (
  c: Context<typeConfig.Context>,
  user: userModel.Record,
  bodyDto: identityDto.PostChangePasswordDto,
): Promise<true> => {
  if (!user.password) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.NoUser,
    )
    throw new errorConfig.NotFound(messageConfig.RequestError.NoUser)
  }

  const isSame = cryptoUtil.bcryptCompare(
    bodyDto.password,
    user.password,
  )
  if (isSame) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.RequireDifferentPassword,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.RequireDifferentPassword)
  }

  const password = await cryptoUtil.bcryptText(bodyDto.password)

  await userModel.update(
    c.env.DB,
    user.id,
    { password },
  )
  return true
}

export const changeUserEmail = async (
  c: Context<typeConfig.Context>,
  user: userModel.Record,
  bodyDto: identityDto.PostChangeEmailDto,
): Promise<true> => {
  const isSame = user.email === bodyDto.email
  if (isSame) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.RequireDifferentEmail,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.RequireDifferentEmail)
  }

  await userModel.update(
    c.env.DB,
    user.id,
    { email: bodyDto.email },
  )
  return true
}

export const skipUserPasskeyEnroll = async (
  c: Context<typeConfig.Context>,
  user: userModel.Record,
) => {
  await userModel.update(
    c.env.DB,
    user.id,
    { skipPasskeyEnroll: 1 },
  )
  return true
}

export const enrollUserMfa = async (
  c: Context<typeConfig.Context>,
  authId: string,
  mfaType: userModel.MfaType,
): Promise<userModel.Record> => {
  const {
    OTP_MFA_IS_REQUIRED: otpMfaRequired,
    EMAIL_MFA_IS_REQUIRED: emailMfaRequired,
    SMS_MFA_IS_REQUIRED: smsMfaRequired,
  } = env(c)

  const user = await userModel.getByAuthId(
    c.env.DB,
    authId,
  )
  if (!user) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.NoUser,
    )
    throw new errorConfig.NotFound(messageConfig.RequestError.NoUser)
  }

  if (!user.isActive) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.UserDisabled,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.UserDisabled)
  }

  if (user.mfaTypes.includes(mfaType)) return user

  if (mfaType === userModel.MfaType.Otp && !otpMfaRequired) {
    return userModel.update(
      c.env.DB,
      user.id,
      {
        mfaTypes: [...user.mfaTypes, mfaType].join(','),
        otpVerified: 0,
      },
    )
  } else if (mfaType === userModel.MfaType.Email && !emailMfaRequired) {
    return userModel.update(
      c.env.DB,
      user.id,
      { mfaTypes: [...user.mfaTypes, mfaType].join(',') },
    )
  } else if (mfaType === userModel.MfaType.Sms && !smsMfaRequired) {
    return userModel.update(
      c.env.DB,
      user.id,
      { mfaTypes: [...user.mfaTypes, mfaType].join(',') },
    )
  }

  return user
}

export const resetUserMfa = async (
  c: Context<typeConfig.Context>,
  authId: string,
  mfaType?: userModel.MfaType,
): Promise<true> => {
  const user = await userModel.getByAuthId(
    c.env.DB,
    authId,
  )
  if (!user) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.NoUser,
    )
    throw new errorConfig.NotFound(messageConfig.RequestError.NoUser)
  }

  if (!user.isActive) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.UserDisabled,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.UserDisabled)
  }

  if (mfaType === userModel.MfaType.Otp) {
    if (
      !user.mfaTypes.includes(userModel.MfaType.Otp) &&
      !user.otpVerified &&
      !user.otpSecret
    ) return true

    await userModel.update(
      c.env.DB,
      user.id,
      {
        mfaTypes: user.mfaTypes.filter((type) => type !== mfaType).join(','),
        otpVerified: 0,
        otpSecret: '',
      },
    )
  } else if (mfaType === userModel.MfaType.Email) {
    if (!user.mfaTypes.includes(userModel.MfaType.Email)) return true
    await userModel.update(
      c.env.DB,
      user.id,
      { mfaTypes: user.mfaTypes.filter((type) => type !== mfaType).join(',') },
    )
  } else if (mfaType === userModel.MfaType.Sms) {
    if (
      !user.mfaTypes.includes(userModel.MfaType.Sms) &&
      !user.smsPhoneNumber &&
      !user.smsPhoneNumberVerified
    ) return true
    await userModel.update(
      c.env.DB,
      user.id,
      {
        mfaTypes: user.mfaTypes.filter((type) => type !== mfaType).join(','),
        smsPhoneNumber: null,
        smsPhoneNumberVerified: 0,
      },
    )
  } else {
    await userModel.update(
      c.env.DB,
      user.id,
      {
        mfaTypes: '',
        otpVerified: 0,
        otpSecret: '',
        smsPhoneNumber: null,
        smsPhoneNumberVerified: 0,
      },
    )
  }

  return true
}

export const increaseLoginCount = async (
  c: Context<typeConfig.Context>,
  userId: number,
) => {
  await userModel.updateCount(
    c.env.DB,
    userId,
  )
  return true
}

export const updateUserLinking = async (
  c: Context<typeConfig.Context>,
  userId: number,
  targetAuthId: string | null,
): Promise<userModel.Record> => {
  const user = await userModel.update(
    c.env.DB,
    userId,
    { linkedAuthId: targetAuthId },
  )
  return user
}

export const genUserOtp = async (
  c: Context<typeConfig.Context>,
  userId: number,
): Promise<userModel.Record> => {
  const otpSecret = cryptoUtil.genOtpSecret()
  const user = await userModel.update(
    c.env.DB,
    userId,
    { otpSecret },
  )
  return user
}

export const markOtpAsVerified = async (
  c: Context<typeConfig.Context>,
  userId: number,
): Promise<void> => {
  await userModel.update(
    c.env.DB,
    userId,
    { otpVerified: 1 },
  )
}

export const updateUser = async (
  c: Context<typeConfig.Context>,
  authId: string,
  dto: userDto.PutUserDto,
  attributeValues?: Record<number, string | null>,
): Promise<userModel.ApiRecordFull> => {
  const user = await userModel.getByAuthId(
    c.env.DB,
    authId,
  )

  if (!user) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.NoUser,
    )
    throw new errorConfig.NotFound(messageConfig.RequestError.NoUser)
  }

  const updateObj: userModel.Update = {}
  if (dto.firstName !== undefined) updateObj.firstName = dto.firstName
  if (dto.lastName !== undefined) updateObj.lastName = dto.lastName
  if (dto.locale !== undefined) updateObj.locale = dto.locale
  if (dto.isActive !== undefined) updateObj.isActive = dto.isActive ? 1 : 0
  if (dto.orgSlug !== undefined) updateObj.orgSlug = dto.orgSlug

  if (updateObj.orgSlug && dto.orgSlug !== user.orgSlug && variableConfig.systemConfig.enableOrgGroup) {
    await userOrgGroupModel.removeByUser(
      c.env.DB,
      user.id,
    )
  }

  const updatedUser = Object.keys(updateObj).length
    ? await userModel.update(
      c.env.DB,
      user.id,
      updateObj,
    )
    : user

  const {
    ENABLE_NAMES: enableNames, ENABLE_ORG: enableOrg,
  } = env(c)

  const userRoles = await userRoleModel.getAllByUserId(
    c.env.DB,
    user.id,
  )

  if (dto.roles && userRoles) {
    const allRoles = await roleModel.getAll(c.env.DB)
    const targetRoles = allRoles.filter((role) => !!dto.roles?.includes(role.name))

    const recordsToDisable = userRoles.filter((userRole) => targetRoles.every((role) => role.id !== userRole.roleId))
    const recordsToCreate = targetRoles.filter((role) => userRoles.every((userRole) => userRole.roleId !== role.id))

    const currentTime = timeUtil.getDbCurrentTime()
    for (const recordToDisable of recordsToDisable) {
      await userRoleModel.update(
        c.env.DB,
        recordToDisable.id,
        { deletedAt: currentTime },
      )
    }

    for (const recordToCreate of recordsToCreate) {
      await userRoleModel.create(
        c.env.DB,
        {
          userId: user.id, roleId: recordToCreate.id,
        },
      )
    }
  }

  const roleNames = dto.roles ?? (userRoles).map((userRole) => userRole.roleName)

  const org = updatedUser.orgSlug
    ? await orgModel.getBySlug(
      c.env.DB,
      updatedUser.orgSlug,
    )
    : undefined

  const orgGroups = org
    ? await userOrgGroupModel.getAllByUser(
      c.env.DB,
      updatedUser.id,
    )
    : []

  let attributeValuesByAttributeName: Record<string, string> | undefined
  if (attributeValues) {
    const userAttributes = await userAttributeModel.getAll(c.env.DB)
    const userAttributeValues = await userAttributeValueModel.getAllByUserId(
      c.env.DB,
      updatedUser.id,
    )
    const attributeValuesToCreate: userAttributeValueModel.Create[] = []
    const attributeValuesToUpdate: { id: number; data: userAttributeValueModel.Update }[] = []
    const attributeValueIdsToDelete: number[] = []

    userAttributes.forEach((userAttribute) => {
      const newValue = attributeValues[userAttribute.id]
      const oldValue = userAttributeValues.find((userAttributeValue) => {
        return userAttributeValue.userAttributeId === userAttribute.id
      })
      if (!newValue && oldValue) {
        attributeValueIdsToDelete.push(oldValue.id)
      } else if (newValue && !oldValue) {
        attributeValuesToCreate.push({
          userId: updatedUser.id, userAttributeId: userAttribute.id, value: newValue,
        })
      } else if (newValue && oldValue) {
        attributeValuesToUpdate.push({
          id: oldValue.id, data: { value: newValue },
        })
      }
    })

    for (const attributeValueId of attributeValueIdsToDelete) {
      await userAttributeValueModel.remove(
        c.env.DB,
        attributeValueId,
      )
    }

    for (const attributeValueToCreate of attributeValuesToCreate) {
      await userAttributeValueModel.create(
        c.env.DB,
        attributeValueToCreate,
      )
    }

    for (const attributeValueToUpdate of attributeValuesToUpdate) {
      await userAttributeValueModel.update(
        c.env.DB,
        attributeValueToUpdate.id,
        attributeValueToUpdate.data,
      )
    }

    attributeValuesByAttributeName = {}
    for (const [attributeId, value] of Object.entries(attributeValues)) {
      if (value) {
        const attribute = userAttributes.find((attribute) => attribute.id === Number(attributeId))
        if (attribute) {
          attributeValuesByAttributeName[attribute.name] = value
        }
      }
    }
  }

  return userModel.convertToApiRecordFull(
    updatedUser,
    enableNames,
    enableOrg,
    roleNames,
    org,
    orgGroups,
    attributeValuesByAttributeName,
  )
}

export const deleteUser = async (
  c: Context<typeConfig.Context>,
  authId: string,
): Promise<true> => {
  const user = await userModel.getByAuthId(
    c.env.DB,
    authId,
  )
  if (!user) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.NoUser,
    )
    throw new errorConfig.NotFound(messageConfig.RequestError.NoUser)
  }
  await userModel.remove(
    c.env.DB,
    user.id,
  )
  await userAppConsentModel.removeByUser(
    c.env.DB,
    user.id,
  )
  return true
}

export const updateUserOrgSlug = async (
  c: Context<typeConfig.Context>,
  oldSlug: string,
  newSlug: string,
) => {
  await userModel.updateOrgSlug(
    c.env.DB,
    oldSlug,
    newSlug,
  )
}
