import {
  IsArray,
  IsEnum,
  IsNotEmpty, IsOptional, IsString, Length,
} from 'class-validator'
import { ClientType } from 'shared'

export interface ScopeLocale {
  locale: string;
  value: string;
}

export class PutScopeReqDto {
  @IsString()
  @Length(
    1,
    50,
  )
  @IsOptional()
    name: string

  @IsString()
  @IsOptional()
    note: string

  @IsArray()
  @IsOptional()
    locales?: ScopeLocale[]

  constructor (dto: PutScopeReqDto) {
    this.name = dto.name
    this.note = dto.note
    this.locales = dto.locales
  }
}

export class PostScopeReqDto {
  @IsEnum(ClientType)
    type: ClientType

  @IsString()
  @Length(
    1,
    50,
  )
  @IsNotEmpty()
    name: string

  @IsString()
  @IsOptional()
    note: string

  @IsArray()
  @IsOptional()
    locales?: ScopeLocale[]

  constructor (dto: PostScopeReqDto) {
    this.name = dto.name
    this.type = dto.type
    this.note = dto.note
    this.locales = dto.locales
  }
}
