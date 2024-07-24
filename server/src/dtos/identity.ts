import {
  IsEmail, IsNotEmpty, IsOptional, IsString, IsStrongPassword, Length,
} from 'class-validator'
import { oauthDto } from 'dtos'

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

  constructor (dto: PostAuthorizeReqWithNamesDto) {
    super(dto)
    this.firstName = dto.firstName ?? null
    this.lastName = dto.lastName ?? null
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

export class GetAuthorizeConsentReqDto {
  @IsString()
  @IsNotEmpty()
    state: string

  @IsString()
  @IsNotEmpty()
    code: string

  @IsString()
  @IsNotEmpty()
    redirectUri: string

  constructor (dto: GetAuthorizeConsentReqDto) {
    this.state = dto.state
    this.code = dto.code
    this.redirectUri = dto.redirectUri
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

  constructor (dto: GetVerifyEmailReqDto) {
    this.id = dto.id.trim()
  }
}

export class PostVerifyEmailReqDto extends GetVerifyEmailReqDto {
  @IsString()
  @Length(
    8,
    8,
  )
    code: string

  constructor (dto: PostVerifyEmailReqDto) {
    super(dto)
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
