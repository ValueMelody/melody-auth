import {
  IsEmail, IsNotEmpty, IsString, IsStrongPassword,
} from 'class-validator'

export class SignInDto {
  @IsEmail()
    email: string

  @IsStrongPassword()
    password: string

  constructor (dto: SignInDto) {
    this.email = dto.email.toLowerCase()
    this.password = dto.password
  }
}

export class AuthCodeTokenExchangeDto {
  @IsString()
  @IsNotEmpty()
    codeVerifier: string

  constructor (dto: AuthCodeTokenExchangeDto) {
    this.codeVerifier = dto.codeVerifier
  }
}

export class RefreshTokenTokenExchangeDto {
  @IsString()
  @IsNotEmpty()
    refreshToken: string

  constructor (dto: RefreshTokenTokenExchangeDto) {
    this.refreshToken = dto.refreshToken
  }
}
