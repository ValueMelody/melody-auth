import {
  IsBoolean,
  IsEnum,
  IsNotEmpty, IsOptional, IsString, IsUrl, Length,
} from 'class-validator'
import { ClientType } from 'shared'
import { requestUtil } from 'utils'

const formatRedirectUri = (redirectUris: string[]) => redirectUris
  .map((uri) => requestUtil.stripEndingSlash(uri.trim().toLowerCase()))

export class PostAppReqDto {
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

  @IsUrl(
    {
      require_protocol: true, require_tld: false,
    },
    { each: true },
  )
  @IsNotEmpty()
    redirectUris: string[]

  constructor (dto: PostAppReqDto) {
    this.name = dto.name.trim()
    this.type = dto.type
    this.scopes = dto.scopes
    this.redirectUris = formatRedirectUri(dto.redirectUris)
  }
}

export class PutAppReqDto {
  @IsUrl(
    {
      require_protocol: true, require_tld: false,
    },
    { each: true },
  )
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

  constructor (dto: PutAppReqDto) {
    this.redirectUris = dto.redirectUris ? formatRedirectUri(dto.redirectUris) : undefined
    this.name = dto.name
    this.isActive = dto.isActive
    this.scopes = dto.scopes
  }
}
