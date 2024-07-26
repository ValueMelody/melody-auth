import {
  IsEnum,
  IsNotEmpty, IsString, Length,
} from 'class-validator'
import { ClientType } from 'shared'
import { formatUtil } from 'utils'

const formatRedirectUri = (redirectUris?: string[]) => redirectUris
  ?.map((uri) => formatUtil.stripEndingSlash(uri.trim().toLowerCase())) ?? []

export class PostAppReqDto {
  @IsString()
  @Length(
    1,
    50,
  )
  @IsNotEmpty()
    name: string

  @IsEnum(ClientType)
    type: ClientType

  @IsString({ each: true })
    scopes: string[]

  @IsString({ each: true })
    redirectUris: string[]

  constructor (dto: PostAppReqDto) {
    this.name = dto.name.trim()
    this.type = dto.type
    this.scopes = dto.scopes
    this.redirectUris = formatRedirectUri(dto.redirectUris)
  }
}

export class PutAppReqDto {
  @IsString({ each: true })
    redirectUris: string[]

  constructor (dto: PutAppReqDto) {
    this.redirectUris = formatRedirectUri(dto.redirectUris)
  }
}
