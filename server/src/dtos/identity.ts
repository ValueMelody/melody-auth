import {
  IsEmail, IsNotEmpty, IsOptional, IsString, IsStrongPassword, Length,
} from 'class-validator'
import { oauthDto } from 'dtos'

export class PostAuthorizeReqBodyWithPasswordDto extends oauthDto.GetAuthorizeReqQueryDto {
  @IsEmail()
    email: string

  @IsStrongPassword()
    password: string

  constructor (dto: PostAuthorizeReqBodyWithPasswordDto) {
    super(dto)
    this.email = dto.email.toLowerCase()
    this.password = dto.password
  }
}

export class PostAuthorizeReqBodyWithNamesDto extends PostAuthorizeReqBodyWithPasswordDto {
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

  constructor (dto: PostAuthorizeReqBodyWithNamesDto) {
    super(dto)
    this.firstName = dto.firstName ?? null
    this.lastName = dto.lastName ?? null
  }
}

export class PostAuthorizeReqBodyWithRequiredNamesDto extends PostAuthorizeReqBodyWithPasswordDto {
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

  constructor (dto: PostAuthorizeReqBodyWithRequiredNamesDto) {
    super(dto)
    this.firstName = dto.firstName
    this.lastName = dto.lastName
  }
}

export class GetAuthorizeConsentReqQueryDto {
  @IsString()
  @IsNotEmpty()
    state: string

  @IsString()
  @IsNotEmpty()
    code: string

  @IsString()
  @IsNotEmpty()
    redirectUri: string

  constructor (dto: GetAuthorizeConsentReqQueryDto) {
    this.state = dto.state
    this.code = dto.code
    this.redirectUri = dto.redirectUri
  }
}

export class PostLogoutReqBodyDto {
  @IsString()
  @IsNotEmpty()
    refreshToken: string

  @IsString()
    postLogoutRedirectUri: string

  constructor (dto: PostLogoutReqBodyDto) {
    this.refreshToken = dto.refreshToken
    this.postLogoutRedirectUri = dto.postLogoutRedirectUri.trim()
  }
}

export class GetVerifyEmailReqQueryDto {
  @IsString()
  @IsNotEmpty()
    id: string

  constructor (dto: GetVerifyEmailReqQueryDto) {
    this.id = dto.id.trim()
  }
}

export class PostVerifyEmailReqBodyDto extends GetVerifyEmailReqQueryDto {
  @IsString()
  @Length(
    8,
    8,
  )
    code: string

  constructor (dto: PostVerifyEmailReqBodyDto) {
    super(dto)
    this.code = dto.code.trim()
  }
}

export class PostAuthorizeResetReqBodyDto {
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

  constructor (dto: PostAuthorizeResetReqBodyDto) {
    this.email = dto.email.trim().toLowerCase()
    this.password = dto.password.trim()
    this.code = dto.code.trim()
  }
}
