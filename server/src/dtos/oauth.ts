import {
  ArrayMinSize, IsEnum, IsString, IsNotEmpty,
  IsOptional,
} from 'class-validator'
import { typeConfig } from 'configs'

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
}

const parseScopes = (scopes: string[]) => scopes.map((s) => s.trim().toLowerCase())

export class GetAuthorizeReqDto {
  @IsString()
  @IsNotEmpty()
    clientId: string

  @IsString()
  @IsNotEmpty()
    redirectUri: string

  @IsEnum(AuthorizeResponseType)
    responseType: string

  @IsString()
  @IsNotEmpty()
    state: string

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

  @IsEnum(Policy)
  @IsOptional()
    policy?: string | undefined

  @IsString()
  @IsOptional()
    org?: string | undefined

  constructor (dto: GetAuthorizeReqDto) {
    this.clientId = dto.clientId
    this.redirectUri = dto.redirectUri.toLowerCase()
    this.responseType = dto.responseType.toLowerCase()
    this.state = dto.state
    this.codeChallenge = dto.codeChallenge
    this.codeChallengeMethod = dto.codeChallengeMethod.toLowerCase()
    this.scopes = parseScopes(dto.scopes)
    this.locale = dto.locale
    this.policy = dto.policy
    this.org = dto.org
  }
}

export class PostTokenAuthCodeReqDto {
  @IsEnum(TokenGrantType)
    grantType: string

  @IsString()
  @IsNotEmpty()
    code: string

  @IsString()
  @IsNotEmpty()
    codeVerifier: string

  constructor (dto: PostTokenAuthCodeReqDto) {
    this.grantType = dto.grantType
    this.code = dto.code
    this.codeVerifier = dto.codeVerifier
  }
}

export class PostTokenRefreshTokenReqDto {
  @IsEnum(TokenGrantType)
    grantType: string

  @IsString()
  @IsNotEmpty()
    refreshToken: string

  constructor (dto: PostTokenRefreshTokenReqDto) {
    this.grantType = dto.grantType
    this.refreshToken = dto.refreshToken
  }
}

export class PostTokenClientCredentialsReqDto {
  @IsEnum(TokenGrantType)
    grantType: string

  @IsString({ each: true })
  @ArrayMinSize(1)
    scopes: string[]

  constructor (dto: PostTokenClientCredentialsReqDto) {
    this.grantType = dto.grantType.toLowerCase()
    this.scopes = parseScopes(dto.scopes)
  }
}

export class GetLogoutReqDto {
  @IsString()
  @IsNotEmpty()
    postLogoutRedirectUri: string

  @IsString()
  @IsNotEmpty()
    clientId: string

  constructor (dto: GetLogoutReqDto) {
    this.clientId = dto.clientId.trim()
    this.postLogoutRedirectUri = dto.postLogoutRedirectUri.trim()
  }
}
