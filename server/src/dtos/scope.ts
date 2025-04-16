import {
  IsArray,
  IsEnum,
  IsNotEmpty, IsOptional, IsString, Length,
} from 'class-validator'
import { ClientType } from '@melody-auth/shared'

export interface ScopeLocale {
  locale: string;
  value: string;
}

export class PutScopeDto {
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

  constructor (dto: PutScopeDto) {
    this.name = dto.name
    this.note = dto.note
    this.locales = dto.locales
  }
}

export class PostScopeDto {
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

  constructor (dto: PostScopeDto) {
    this.name = dto.name
    this.type = dto.type
    this.note = dto.note
    this.locales = dto.locales
  }
}
