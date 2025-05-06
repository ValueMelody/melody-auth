import {
  IsBoolean,
  IsEnum,
  IsNotEmpty, IsOptional, IsString, Length,
} from 'class-validator'
import { ClientType } from '@melody-auth/shared'
import { requestUtil } from 'utils'

const formatRedirectUri = (redirectUris: string[]) => redirectUris
  .map((uri) => requestUtil.stripEndingSlash(uri.trim().toLowerCase()))

export class PostAppDto {
  @IsString()
  @Length(
    1,
    50,
  )
  @IsNotEmpty()
    name: string

  @IsEnum(ClientType)
  @IsNotEmpty()
    type: ClientType

  @IsString({ each: true })
  @IsNotEmpty()
    scopes: string[]

  @IsString({ each: true })
  @IsNotEmpty()
    redirectUris: string[]

  constructor (dto: PostAppDto) {
    this.name = dto.name.trim()
    this.type = dto.type
    this.scopes = dto.scopes
    this.redirectUris = formatRedirectUri(dto.redirectUris)
  }
}

export class PutAppDto {
  @IsString({ each: true })
  @IsOptional()
    redirectUris?: string[]

  @IsString()
  @Length(
    1,
    50,
  )
  @IsOptional()
    name?: string

  @IsBoolean()
  @IsOptional()
    isActive?: boolean

  @IsString({ each: true })
  @IsOptional()
    scopes?: string[]

  @IsBoolean()
  @IsOptional()
    useSystemMfaConfig?: boolean

  @IsBoolean()
  @IsOptional()
    requireEmailMfa?: boolean

  @IsBoolean()
  @IsOptional()
    requireOtpMfa?: boolean

  @IsBoolean()
  @IsOptional()
    requireSmsMfa?: boolean

  @IsBoolean()
  @IsOptional()
    allowEmailMfaAsBackup?: boolean

  constructor (dto: PutAppDto) {
    this.redirectUris = dto.redirectUris ? formatRedirectUri(dto.redirectUris) : undefined
    this.name = dto.name
    this.isActive = dto.isActive
    this.scopes = dto.scopes
    this.useSystemMfaConfig = dto.useSystemMfaConfig
    this.requireEmailMfa = dto.requireEmailMfa
    this.requireOtpMfa = dto.requireOtpMfa
    this.requireSmsMfa = dto.requireSmsMfa
    this.allowEmailMfaAsBackup = dto.allowEmailMfaAsBackup
  }
}
