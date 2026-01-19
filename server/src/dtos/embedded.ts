import {
  AuthenticationResponseJSON, RegistrationResponseJSON,
} from '@simplewebauthn/server'
import {
  IsNotEmpty,
  IsString,
  Length,
  IsOptional,
  IsBoolean,
} from 'class-validator'
import * as baseDto from 'dtos/base'
import { userModel } from 'models'

export class SignInDto
  extends baseDto.SignInDto {
    @IsString()
    @IsNotEmpty()
      sessionId: string

    constructor (dto: SignInDto) {
      super(dto)
      this.sessionId = dto.sessionId
    }
}

export class SignInWithRecoveryCodeDto
  extends baseDto.SignInWithRecoveryCodeDto {
  @IsString()
  @IsNotEmpty()
    sessionId: string

  constructor (dto: SignInWithRecoveryCodeDto) {
    super(dto)
    this.sessionId = dto.sessionId
  }
}

export class SignUpDtoWithNames
  extends SignInDto {
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
  extends SignInDto {
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
  extends baseDto.AuthCodeTokenExchangeDto {
  @IsString()
  @IsNotEmpty()
    sessionId: string

  constructor (dto: TokenExchangeDto) {
    super(dto)
    this.sessionId = dto.sessionId
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

export class MfaDto {
  @IsString()
  @IsNotEmpty()
    mfaCode: string

  @IsBoolean()
  @IsOptional()
    rememberDevice: boolean

  constructor (dto: MfaDto) {
    this.mfaCode = dto.mfaCode
    this.rememberDevice = dto.rememberDevice ?? false
  }
}

export class SmsMfaSetupDto {
  @IsString()
  @IsNotEmpty()
    phoneNumber: string

  constructor (dto: SmsMfaSetupDto) {
    this.phoneNumber = dto.phoneNumber
  }
}

export class PostMfaEnrollmentDto {
  @IsString()
  @IsNotEmpty()
    type: userModel.MfaType

  constructor (dto: PostMfaEnrollmentDto) {
    this.type = dto.type
  }
}

export class PostProcessPasskeyEnrollDto {
  @IsNotEmpty()
    enrollInfo: RegistrationResponseJSON

  constructor (dto: PostProcessPasskeyEnrollDto) {
    this.enrollInfo = dto.enrollInfo
  }
}

export class PostProcessPasskeyEnrollDeclineDto {
  @IsBoolean()
    remember: boolean

  constructor (dto: PostProcessPasskeyEnrollDeclineDto) {
    this.remember = dto.remember
  }
}

export class PostPasskeyVerifyDto {
  @IsNotEmpty()
    passkeyInfo: AuthenticationResponseJSON

  @IsString()
  @IsNotEmpty()
    challenge: string

  constructor (dto: PostPasskeyVerifyDto) {
    this.passkeyInfo = dto.passkeyInfo
    this.challenge = dto.challenge
  }
}

export class PostSwitchUserOrgDto {
  @IsString()
  @IsNotEmpty()
    org: string

  constructor (dto: PostSwitchUserOrgDto) {
    this.org = dto.org
  }
}
