import {
  IsStrongPassword, IsEmail, IsNotEmpty, IsString,
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
