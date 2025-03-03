import {
  IsBoolean,
  IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsStrongPassword, Length,
} from 'class-validator'
import { Context } from 'hono'
import {
  AuthenticationResponseJSON, RegistrationResponseJSON,
} from '@simplewebauthn/server'
import { typeConfig } from 'configs'
import { oauthDto } from 'dtos'
import {
  requestUtil, validateUtil,
} from 'utils'
import { userModel } from 'models'

export class PostAuthorizeReqWithPasswordDto extends oauthDto.GetAuthorizeReqDto {
  @IsEmail()
    email: string

  @IsStrongPassword()
    password: string

  constructor (dto: PostAuthorizeReqWithPasswordDto) {
    super(dto)
    this.email = dto.email.toLowerCase()
    this.password = dto.password
  }
}

export class PostAuthorizeReqWithNamesDto extends PostAuthorizeReqWithPasswordDto {
  @IsString()
  @Length(
    0,
    50,
  )
  @IsOptional()
    firstName: string | null

  @IsString()
  @Length(
    0,
    50,
  )
  @IsOptional()
    lastName: string | null

  @IsString()
    locale: typeConfig.Locale

  constructor (dto: PostAuthorizeReqWithNamesDto) {
    super(dto)
    this.firstName = dto.firstName ?? null
    this.lastName = dto.lastName ?? null
    this.locale = dto.locale
  }
}

export class PostAuthorizeReqWithRequiredNamesDto extends PostAuthorizeReqWithPasswordDto {
  @IsString()
  @Length(
    1,
    50,
  )
    firstName: string | null

  @IsString()
  @Length(
    1,
    50,
  )
    lastName: string | null

  constructor (dto: PostAuthorizeReqWithRequiredNamesDto) {
    super(dto)
    this.firstName = dto.firstName
    this.lastName = dto.lastName
  }
}

export class GetAuthorizeFollowUpReqDto {
  @IsString()
  @IsNotEmpty()
    code: string

  @IsString()
    locale: typeConfig.Locale

  @IsString()
  @IsOptional()
    org: string | undefined

  constructor (dto: GetAuthorizeFollowUpReqDto) {
    this.code = dto.code
    this.locale = dto.locale
    this.org = dto.org
  }
}

export const parseGetAuthorizeFollowUpReq = async (c: Context<typeConfig.Context>) => {
  const queryDto = new GetAuthorizeFollowUpReqDto({
    code: c.req.query('code') ?? '',
    locale: requestUtil.getLocaleFromQuery(
      c,
      c.req.query('locale'),
    ),
    org: c.req.query('org'),
  })
  await validateUtil.dto(queryDto)
  return queryDto
}

export class PostAuthorizeFollowUpReqDto extends GetAuthorizeFollowUpReqDto {}

export class PostSetupSmsMfaReqDto extends GetAuthorizeFollowUpReqDto {
  @IsString()
  @IsNotEmpty()
    phoneNumber: string

  constructor (dto: PostSetupSmsMfaReqDto) {
    super(dto)
    this.phoneNumber = dto.phoneNumber
  }
}

export class PostAuthorizeMfaReqDto extends GetAuthorizeFollowUpReqDto {
  @IsString()
  @IsNotEmpty()
    mfaCode: string

  constructor (dto: PostAuthorizeMfaReqDto) {
    super(dto)
    this.mfaCode = dto.mfaCode
  }
}

export class GetAuthorizePasskeyVerifyReqDto {
  @IsEmail()
  @IsNotEmpty()
    email: string

  constructor (dto: GetAuthorizePasskeyVerifyReqDto) {
    this.email = dto.email.toLowerCase()
  }
}

export class PostAuthorizePasskeyVerifyReqDto extends oauthDto.GetAuthorizeReqDto {
  @IsNotEmpty()
    passkeyInfo: AuthenticationResponseJSON

  @IsEmail()
  @IsNotEmpty()
    email: string

  constructor (dto: PostAuthorizePasskeyVerifyReqDto) {
    super(dto)
    this.passkeyInfo = dto.passkeyInfo
    this.email = dto.email.toLowerCase()
  }
}

export class PostAuthorizePasskeyEnrollDeclineReqDto extends GetAuthorizeFollowUpReqDto {
  @IsBoolean()
    remember: boolean

  constructor (dto: PostAuthorizePasskeyEnrollDeclineReqDto) {
    super(dto)
    this.remember = dto.remember
  }
}

export class GetAuthCodeExpiredReqDto {
  @IsString()
    locale: typeConfig.Locale

  @IsString()
  @IsOptional()
    redirect_uri: string | undefined

  @IsString()
  @IsOptional()
    org: string | undefined

  constructor (dto: GetAuthCodeExpiredReqDto) {
    this.locale = dto.locale
    this.redirect_uri = dto.redirect_uri
    this.org = dto.org
  }
}

export class PostAuthorizePasskeyEnrollReqDto extends GetAuthorizeFollowUpReqDto {
  @IsNotEmpty()
    enrollInfo: RegistrationResponseJSON

  constructor (dto: PostAuthorizePasskeyEnrollReqDto) {
    super(dto)
    this.enrollInfo = dto.enrollInfo
  }
}

/**
 * DTO for MFA
 */
export class PostProcessMfaEnrollDto extends GetAuthorizeFollowUpReqDto {
  @IsEnum(userModel.MfaType)
  @IsNotEmpty()
    type: userModel.MfaType

  constructor (dto: PostProcessMfaEnrollDto) {
    super(dto)
    this.type = dto.type
  }
}

/**
 * DTO for Social-signin
*/
export class PostAuthorizeSocialSignInDto extends oauthDto.GetAuthorizeReqDto {
  @IsString()
  @IsNotEmpty()
    credential: string

  constructor (dto: PostAuthorizeSocialSignInDto) {
    super(dto)
    this.credential = dto.credential
  }
}

/**
 * DTO for policies
 */
export class PostChangePasswordDto extends GetAuthorizeFollowUpReqDto {
  @IsString()
  @IsNotEmpty()
    password: string

  constructor (dto: PostChangePasswordDto) {
    super(dto)
    this.password = dto.password
  }
}

export class PostChangeEmailCodeDto extends GetAuthorizeFollowUpReqDto {
  @IsEmail()
  @IsNotEmpty()
    email: string

  constructor (dto: PostChangeEmailCodeDto) {
    super(dto)
    this.email = dto.email.trim().toLowerCase()
  }
}

export class PostChangeEmailDto extends PostChangeEmailCodeDto {
  @IsString()
  @Length(
    6,
    6,
  )
    verificationCode: string

  constructor (dto: PostChangeEmailDto) {
    super(dto)
    this.verificationCode = dto.verificationCode.trim()
  }
}

export class PostManagePasskeyDto extends GetAuthorizeFollowUpReqDto {
  @IsNotEmpty()
    enrollInfo: RegistrationResponseJSON

  constructor (dto: PostManagePasskeyDto) {
    super(dto)
    this.enrollInfo = dto.enrollInfo
  }
}

export class DeleteManagePasskeyDto extends GetAuthorizeFollowUpReqDto {}

export class PostLogoutReqDto {
  @IsString()
  @IsNotEmpty()
    refreshToken: string

  @IsString()
    postLogoutRedirectUri: string

  constructor (dto: PostLogoutReqDto) {
    this.refreshToken = dto.refreshToken
    this.postLogoutRedirectUri = dto.postLogoutRedirectUri.trim()
  }
}

export class PostUpdateInfoDto extends GetAuthorizeFollowUpReqDto {
  @IsString()
    firstName?: string

  @IsString()
    lastName?: string

  constructor (dto: PostUpdateInfoDto) {
    super(dto)
    this.firstName = dto.firstName
    this.lastName = dto.lastName
  }
}

/**
 * DTO for other requests
 */
export class PostVerifyEmailDto {
  @IsString()
  @IsNotEmpty()
    id: string

  @IsString()
  @Length(
    6,
    6,
  )
    code: string

  constructor (dto: PostVerifyEmailDto) {
    this.id = dto.id.trim()
    this.code = dto.code.trim()
  }
}

export class PostResetPasswordDto {
  @IsString()
  @Length(
    6,
    6,
  )
    code: string

  @IsEmail()
  @IsNotEmpty()
    email: string

  @IsStrongPassword()
  @IsNotEmpty()
    password: string

  constructor (dto: PostResetPasswordDto) {
    this.email = dto.email.trim().toLowerCase()
    this.password = dto.password.trim()
    this.code = dto.code.trim()
  }
}

/**
 * DTO for views
 */
export class GetVerifyEmailViewDto {
  @IsString()
  @IsNotEmpty()
    id: string

  @IsString()
    locale: typeConfig.Locale

  @IsString()
  @IsOptional()
    org: string | undefined

  constructor (dto: GetVerifyEmailViewDto) {
    this.id = dto.id.trim()
    this.locale = dto.locale
    this.org = dto.org
  }
}
