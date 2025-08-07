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

export class SignInWithRecoveryCodeDto {
  @IsEmail()
    email: string

  @IsString()
    recoveryCode: string

  constructor (dto: SignInWithRecoveryCodeDto) {
    this.email = dto.email.toLowerCase()
    this.recoveryCode = dto.recoveryCode
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

export class ResetPasswordDto {
  @IsEmail()
  @IsNotEmpty()
    email: string

  constructor (dto: ResetPasswordDto) {
    this.email = dto.email
  }
}

export class PasskeyVerifyDto {
  @IsEmail()
  @IsNotEmpty()
    email: string

  constructor (dto: PasskeyVerifyDto) {
    this.email = dto.email.toLowerCase()
  }
}

export class GetAppBannersDto {
  @IsString()
  @IsNotEmpty()
    clientId: string

  constructor (dto: GetAppBannersDto) {
    this.clientId = dto.clientId
  }
}
