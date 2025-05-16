import {
  IsStrongPassword, IsEmail, IsNotEmpty, IsString,
  Length,
  IsOptional,
} from 'class-validator'
import * as baseDto from 'dtos/base'

export class EmbeddedSessionDto {
  @IsString()
  @IsNotEmpty()
    sessionId: string

  constructor (dto: EmbeddedSessionDto) {
    this.sessionId = dto.sessionId
  }
}

export class SignInDto
  extends EmbeddedSessionDto
  implements baseDto.SignInDto {
  @IsEmail()
    email: string

  @IsStrongPassword()
    password: string

  constructor (dto: SignInDto) {
    super(dto)
    this.email = dto.email.toLowerCase()
    this.password = dto.password
  }
}

export class SignUpDtoWithNames
  extends SignInDto
  implements baseDto.NamesDto {
  @IsString()
  @IsOptional()
  @Length(
    1,
    50,
  )
    firstName: string | null

  @IsString()
  @IsOptional()
  @Length(
    1,
    50,
  )
    lastName: string | null

  constructor (dto: SignUpDtoWithNames) {
    super(dto)
    this.firstName = dto.firstName ?? null
    this.lastName = dto.lastName ?? null
  }
}

export class SignUpDtoWithRequiredNames
  extends SignInDto
  implements baseDto.RequiredNamesDto {
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

  constructor (dto: SignUpDtoWithRequiredNames) {
    super(dto)
    this.firstName = dto.firstName
    this.lastName = dto.lastName
  }
}

export class TokenExchangeDto
  extends EmbeddedSessionDto
  implements baseDto.AuthCodeTokenExchangeDto {
  @IsString()
  @IsNotEmpty()
    codeVerifier: string

  constructor (dto: TokenExchangeDto) {
    super(dto)
    this.codeVerifier = dto.codeVerifier
  }
}

export class TokenRefreshDto extends baseDto.RefreshTokenTokenExchangeDto {}

export class SignOutDto {
  @IsString()
  @IsNotEmpty()
    refreshToken: string

  @IsString()
  @IsNotEmpty()
    clientId: string

  constructor (dto: SignOutDto) {
    this.refreshToken = dto.refreshToken
    this.clientId = dto.clientId
  }
}

export class ResetPasswordDto extends baseDto.ResetPasswordDto {
  @IsString()
  @IsOptional()
    locale: string

  constructor (dto: ResetPasswordDto) {
    super(dto)
    this.locale = dto.locale
  }
}
