import {
  ArrayMinSize, IsEnum, IsString, IsEmail, IsStrongPassword, IsNotEmpty,
  IsOptional,
  Length,
} from 'class-validator'

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

const parseScopes = (scope: string[]) => scope.map((s) => s.trim().toLowerCase())

export class GetAuthorizeReqQueryDto {
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

  constructor (dto: GetAuthorizeReqQueryDto) {
    this.clientId = dto.clientId.toLowerCase()
    this.redirectUri = dto.redirectUri.toLowerCase()
    this.responseType = dto.responseType.toLowerCase()
    this.state = dto.state
    this.codeChallenge = dto.codeChallenge
    this.codeChallengeMethod = dto.codeChallengeMethod.toLowerCase()
    this.scopes = parseScopes(dto.scopes)
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

export class PostAuthorizeReqBodyWithPasswordDto extends GetAuthorizeReqQueryDto {
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

export class PostTokenAuthCodeReqBodyDto {
  @IsEnum(TokenGrantType)
    grantType: string

  @IsString()
  @IsNotEmpty()
    code: string

  @IsString()
  @IsNotEmpty()
    codeVerifier: string

  constructor (dto: PostTokenAuthCodeReqBodyDto) {
    this.grantType = dto.grantType
    this.code = dto.code
    this.codeVerifier = dto.codeVerifier
  }
}

export class PostTokenRefreshTokenReqBodyDto {
  @IsEnum(TokenGrantType)
    grantType: string

  @IsString()
  @IsNotEmpty()
    refreshToken: string

  constructor (dto: PostTokenRefreshTokenReqBodyDto) {
    this.grantType = dto.grantType
    this.refreshToken = dto.refreshToken
  }
}

export class PostTokenClientCredentialsReqBodyDto {
  @IsEnum(TokenGrantType)
    grantType: string

  @IsString()
  @IsNotEmpty()
    clientId: string

  @IsString()
  @IsNotEmpty()
    secret: string

  @IsString({ each: true })
  @ArrayMinSize(1)
    scopes: string[]

  constructor (dto: PostTokenClientCredentialsReqBodyDto) {
    this.grantType = dto.grantType.toLowerCase()
    this.clientId = dto.clientId
    this.secret = dto.secret
    this.scopes = parseScopes(dto.scopes)
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
