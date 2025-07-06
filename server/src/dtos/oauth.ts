import {
  ArrayMinSize, IsEnum, IsString, IsNotEmpty,
  IsOptional,
} from 'class-validator'
import { typeConfig } from 'configs'
import * as baseDto from 'dtos/base'

enum AuthorizeResponseType {
  Code = 'code',
}

export enum AuthorizeCodeChallengeMethod {
  S256 = 's256',
  Plain = 'plain',
}

export enum TokenGrantType {
  AuthorizationCode = 'authorization_code',
  RefreshToken = 'refresh_token',
  ClientCredentials = 'client_credentials',
}

export enum Policy {
  SignInOrSignUp = 'sign_in_or_sign_up',
  ChangePassword = 'change_password',
  ChangeEmail = 'change_email',
  ResetMfa = 'reset_mfa',
  ManagePasskey = 'manage_passkey',
  UpdateInfo = 'update_info',
  ManageRecoveryCode = 'manage_recovery_code',
  SamSso = 'saml_sso_',
  Oidc = 'oidc_sso_',
}

const parseScopes = (scopes: string[]) => scopes.map((s) => s.trim().toLowerCase())

export class CoreAuthorizeDto {
  @IsString()
  @IsNotEmpty()
    redirectUri: string

  @IsString()
  @IsNotEmpty()
    clientId: string

  @IsString()
  @IsNotEmpty()
    codeChallenge: string

  @IsEnum(AuthorizeCodeChallengeMethod)
    codeChallengeMethod: string

  @IsString({ each: true })
  @ArrayMinSize(1)
    scopes: string[]

  @IsString()
    locale: typeConfig.Locale

  @IsString()
  @IsOptional()
    org?: string | undefined

  constructor (dto: CoreAuthorizeDto) {
    this.redirectUri = dto.redirectUri.toLowerCase()
    this.clientId = dto.clientId
    this.codeChallenge = dto.codeChallenge
    this.codeChallengeMethod = dto.codeChallengeMethod?.toLowerCase()
    this.scopes = parseScopes(dto.scopes)
    this.locale = dto.locale
    this.org = dto.org
  }
}

export class GetAuthorizeDto extends CoreAuthorizeDto {
  @IsEnum(AuthorizeResponseType)
    responseType: string

  @IsString()
  @IsNotEmpty()
    state: string

  @IsString()
  @IsOptional()
    authorizeMethod?: string | undefined

  @IsString()
  @IsOptional()
    policy?: string | undefined

  constructor (dto: GetAuthorizeDto) {
    super(dto)
    this.responseType = dto.responseType.toLowerCase()
    this.state = dto.state
    this.authorizeMethod = dto.authorizeMethod
    this.policy = dto.policy
  }
}

export class PostTokenAuthCodeDto extends baseDto.AuthCodeTokenExchangeDto {
  @IsEnum(TokenGrantType)
    grantType: string

  @IsString()
  @IsNotEmpty()
    code: string

  constructor (dto: PostTokenAuthCodeDto) {
    super(dto)
    this.code = dto.code
    this.grantType = dto.grantType
  }
}

export class PostTokenRefreshTokenDto extends baseDto.RefreshTokenTokenExchangeDto {
  @IsEnum(TokenGrantType)
    grantType: string

  constructor (dto: PostTokenRefreshTokenDto) {
    super(dto)
    this.grantType = dto.grantType
  }
}

export class PostTokenClientCredentialsDto {
  @IsEnum(TokenGrantType)
    grantType: string

  @IsString({ each: true })
  @ArrayMinSize(1)
    scopes: string[]

  constructor (dto: PostTokenClientCredentialsDto) {
    this.grantType = dto.grantType.toLowerCase()
    this.scopes = parseScopes(dto.scopes)
  }
}

export class GetLogoutDto {
  @IsString()
  @IsNotEmpty()
    postLogoutRedirectUri: string

  @IsString()
  @IsNotEmpty()
    clientId: string

  constructor (dto: GetLogoutDto) {
    this.clientId = dto.clientId.trim()
    this.postLogoutRedirectUri = dto.postLogoutRedirectUri.trim()
  }
}
