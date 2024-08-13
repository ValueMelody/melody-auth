import {
  IsEmail, IsNotEmpty, IsOptional, IsString, IsStrongPassword, Length,
} from 'class-validator'
import { Context } from 'hono'
import { typeConfig } from 'configs'
import { oauthDto } from 'dtos'
import {
  formatUtil, validateUtil,
} from 'utils'

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

export class PostAuthorizeConsentReqDto {
  @IsString()
  @IsNotEmpty()
    state: string

  @IsString()
  @IsNotEmpty()
    code: string

  @IsString()
  @IsNotEmpty()
    redirectUri: string

  constructor (dto: GetAuthorizeFollowUpReqDto) {
    this.state = dto.state
    this.code = dto.code
    this.redirectUri = dto.redirectUri
  }
}

export class GetAuthorizeFollowUpReqDto extends PostAuthorizeConsentReqDto {
  @IsString()
    locale: typeConfig.Locale

  constructor (dto: GetAuthorizeFollowUpReqDto) {
    super(dto)
    this.locale = dto.locale
  }
}

export const parseGetAuthorizeFollowUpReq = async (c: Context<typeConfig.Context>) => {
  const queryDto = new GetAuthorizeFollowUpReqDto({
    state: c.req.query('state') ?? '',
    redirectUri: c.req.query('redirect_uri') ?? '',
    code: c.req.query('code') ?? '',
    locale: formatUtil.getLocaleFromQuery(
      c,
      c.req.query('locale'),
    ),
  })
  await validateUtil.dto(queryDto)
  return queryDto
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

export class GetVerifyEmailReqDto {
  @IsString()
  @IsNotEmpty()
    id: string

  @IsString()
    locale: typeConfig.Locale

  constructor (dto: GetVerifyEmailReqDto) {
    this.id = dto.id.trim()
    this.locale = dto.locale
  }
}

export class PostVerifyEmailReqDto {
  @IsString()
  @IsNotEmpty()
    id: string

  @IsString()
  @Length(
    8,
    8,
  )
    code: string

  constructor (dto: PostVerifyEmailReqDto) {
    this.id = dto.id.trim()
    this.code = dto.code.trim()
  }
}

export class PostAuthorizeResetReqDto {
  @IsString()
  @Length(
    8,
    8,
  )
    code: string

  @IsEmail()
  @IsNotEmpty()
    email: string

  @IsStrongPassword()
  @IsNotEmpty()
    password: string

  constructor (dto: PostAuthorizeResetReqDto) {
    this.email = dto.email.trim().toLowerCase()
    this.password = dto.password.trim()
    this.code = dto.code.trim()
  }
}
