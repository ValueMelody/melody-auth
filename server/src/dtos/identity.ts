import {
  IsBoolean,
  IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsStrongPassword, Length,
} from 'class-validator'
import { Context } from 'hono'
import {
  AuthenticationResponseJSON, RegistrationResponseJSON,
} from '@simplewebauthn/server'
import { typeConfig } from 'configs'
import {
  oauthDto, baseDto,
} from 'dtos'
import {
  requestUtil, validateUtil,
} from 'utils'
import { userModel } from 'models'

export class PostAuthorizeWithPasswordDto
  extends oauthDto.GetAuthorizeDto
  implements baseDto.SignInDto {
  @IsEmail()
    email: string

  @IsStrongPassword()
    password: string

  constructor (dto: PostAuthorizeWithPasswordDto) {
    super(dto)
    this.email = dto.email.toLowerCase()
    this.password = dto.password
  }
}

export class PostAuthorizeWithRecoveryCodeDto
  extends oauthDto.GetAuthorizeDto
  implements baseDto.SignInWithRecoveryCodeDto {
  @IsEmail()
    email: string

  @IsString()
    recoveryCode: string

  constructor (dto: PostAuthorizeWithRecoveryCodeDto) {
    super(dto)
    this.email = dto.email.toLowerCase()
    this.recoveryCode = dto.recoveryCode
  }
}

export class PostAuthorizeWithPasswordlessDto extends oauthDto.GetAuthorizeDto {
  @IsEmail()
    email: string

  constructor (dto: PostAuthorizeWithPasswordlessDto) {
    super(dto)
    this.email = dto.email.toLowerCase()
  }
}

export class PostAuthorizeWithNamesDto
  extends PostAuthorizeWithPasswordDto {
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

  constructor (dto: PostAuthorizeWithNamesDto) {
    super(dto)
    this.firstName = dto.firstName ?? null
    this.lastName = dto.lastName ?? null
    this.locale = dto.locale
  }
}

export class PostAuthorizeWithRequiredNamesDto
  extends PostAuthorizeWithPasswordDto {
  @IsString()
  @Length(
    1,
    50,
  )
    firstName: string

  @IsString()
  @Length(
    1,
    50,
  )
    lastName: string

  constructor (dto: PostAuthorizeWithRequiredNamesDto) {
    super(dto)
    this.firstName = dto.firstName
    this.lastName = dto.lastName
  }
}

export class GetProcessDto {
  @IsString()
  @IsNotEmpty()
    code: string

  @IsString()
    locale: typeConfig.Locale

  @IsString()
  @IsOptional()
    org: string | undefined

  constructor (dto: GetProcessDto) {
    this.code = dto.code
    this.locale = dto.locale
    this.org = dto.org
  }
}

export const parseGetProcess = async (c: Context<typeConfig.Context>) => {
  const queryDto = new GetProcessDto({
    code: c.req.query('code') ?? '',
    locale: requestUtil.getLocaleFromQuery(
      c,
      c.req.query('locale'),
    ),
    org: c.req.query('org') ?? c.get('detectedOrgSlug'),
  })
  await validateUtil.dto(queryDto)
  return queryDto
}

export class PostProcessDto extends GetProcessDto {}

/**
 * DTO for MFA
 */
export class PostProcessMfaEnrollDto extends GetProcessDto {
  @IsEnum(userModel.MfaType)
  @IsNotEmpty()
    type: userModel.MfaType

  constructor (dto: PostProcessMfaEnrollDto) {
    super(dto)
    this.type = dto.type
  }
}

export class PostProcessOrgSwitchDto extends GetProcessDto {
  @IsString()
  @IsNotEmpty()
    org: string

  constructor (dto: PostProcessOrgSwitchDto) {
    super(dto)
    this.org = dto.org
  }
}

export class PostAuthorizeMfaDto extends GetProcessDto {
  @IsString()
  @IsNotEmpty()
    mfaCode: string

  @IsBoolean()
  @IsOptional()
    rememberDevice: boolean

  constructor (dto: PostAuthorizeMfaDto) {
    super(dto)
    this.mfaCode = dto.mfaCode
    this.rememberDevice = dto.rememberDevice
  }
}

export class PostSetupSmsMfaDto extends GetProcessDto {
  @IsString()
  @IsNotEmpty()
    phoneNumber: string

  constructor (dto: PostSetupSmsMfaDto) {
    super(dto)
    this.phoneNumber = dto.phoneNumber
  }
}

/**
 * DTO for Passkey
 */
export class PostProcessPasskeyEnrollDto extends GetProcessDto {
  @IsNotEmpty()
    enrollInfo: RegistrationResponseJSON

  constructor (dto: PostProcessPasskeyEnrollDto) {
    super(dto)
    this.enrollInfo = dto.enrollInfo
  }
}

export class PostProcessPasskeyEnrollDeclineDto extends GetProcessDto {
  @IsBoolean()
    remember: boolean

  constructor (dto: PostProcessPasskeyEnrollDeclineDto) {
    super(dto)
    this.remember = dto.remember
  }
}

export class PostAuthorizePasskeyVerifyDto extends oauthDto.GetAuthorizeDto {
  @IsNotEmpty()
    passkeyInfo: AuthenticationResponseJSON

  @IsEmail()
  @IsNotEmpty()
    email: string

  constructor (dto: PostAuthorizePasskeyVerifyDto) {
    super(dto)
    this.passkeyInfo = dto.passkeyInfo
    this.email = dto.email.toLowerCase()
  }
}

/**
 * DTO for Social-signin
*/
export class PostAuthorizeSocialSignInDto extends oauthDto.GetAuthorizeDto {
  @IsString()
  @IsNotEmpty()
    credential: string

  @IsString()
  @IsOptional()
    codeVerifier: string | undefined

  constructor (dto: PostAuthorizeSocialSignInDto) {
    super(dto)
    this.credential = dto.credential
    this.codeVerifier = dto.codeVerifier
  }
}

/**
 * DTO for policies
 */
export class PostChangePasswordDto extends GetProcessDto {
  @IsString()
  @IsNotEmpty()
    password: string

  constructor (dto: PostChangePasswordDto) {
    super(dto)
    this.password = dto.password
  }
}

export class PostChangeEmailCodeDto extends GetProcessDto {
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

export class PostManagePasskeyDto extends GetProcessDto {
  @IsNotEmpty()
    enrollInfo: RegistrationResponseJSON

  constructor (dto: PostManagePasskeyDto) {
    super(dto)
    this.enrollInfo = dto.enrollInfo
  }
}

export class DeleteManagePasskeyDto extends GetProcessDto {}

export class PostLogoutDto {
  @IsString()
  @IsNotEmpty()
    refreshToken: string

  @IsString()
    postLogoutRedirectUri: string

  constructor (dto: PostLogoutDto) {
    this.refreshToken = dto.refreshToken
    this.postLogoutRedirectUri = dto.postLogoutRedirectUri.trim()
  }
}

export class PostUpdateInfoDto extends GetProcessDto {
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

export class GetAuthCodeExpiredViewDto {
  @IsString()
    locale: typeConfig.Locale

  @IsString()
  @IsOptional()
    redirect_uri: string | undefined

  @IsString()
  @IsOptional()
    org: string | undefined

  constructor (dto: GetAuthCodeExpiredViewDto) {
    this.locale = dto.locale
    this.redirect_uri = dto.redirect_uri
    this.org = dto.org
  }
}
