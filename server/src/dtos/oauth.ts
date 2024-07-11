import {
  ArrayMinSize, IsEnum, IsString, IsEmail, IsStrongPassword, IsNotEmpty,
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
}

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
    scope: string[]

  constructor (dto: GetAuthorizeReqQueryDto) {
    this.clientId = dto.clientId.toLowerCase()
    this.redirectUri = dto.redirectUri.toLowerCase()
    this.responseType = dto.responseType.toLowerCase()
    this.state = dto.state
    this.codeChallenge = dto.codeChallenge
    this.codeChallengeMethod = dto.codeChallengeMethod.toLowerCase()
    this.scope = dto.scope.map((val) => val.toLowerCase())
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
