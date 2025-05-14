import {
  IsEmail, IsNotEmpty, IsOptional, IsString, IsStrongPassword,
  Length,
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

export class NamesDto {
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

  constructor (dto: NamesDto) {
    this.firstName = dto.firstName ?? null
    this.lastName = dto.lastName ?? null
  }
}

export class RequiredNamesDto {
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
    lastName: string

  constructor (dto: RequiredNamesDto) {
    this.firstName = dto.firstName
    this.lastName = dto.lastName
  }
}
