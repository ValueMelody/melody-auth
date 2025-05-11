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
  UpdateInfo = 'update_info',
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

  @IsEnum(Policy)
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

export class PostTokenAuthCodeDto {
  @IsEnum(TokenGrantType)
    grantType: string

  @IsString()
  @IsNotEmpty()
    code: string

  @IsString()
  @IsNotEmpty()
    codeVerifier: string

  constructor (dto: PostTokenAuthCodeDto) {
    this.grantType = dto.grantType
    this.code = dto.code
    this.codeVerifier = dto.codeVerifier
  }
}

export class PostTokenRefreshTokenDto {
  @IsEnum(TokenGrantType)
    grantType: string

  @IsString()
  @IsNotEmpty()
    refreshToken: string

  constructor (dto: PostTokenRefreshTokenDto) {
    this.grantType = dto.grantType
    this.refreshToken = dto.refreshToken
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
