import {
  IsEnum,
  IsNotEmpty, IsOptional, IsString, Length,
} from 'class-validator'
import { ClientType } from 'shared'

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

  constructor (dto: PutScopeReqDto) {
    this.name = dto.name
    this.note = dto.note
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

  constructor (dto: PostScopeReqDto) {
    this.name = dto.name
    this.type = dto.type
    this.note = dto.note
  }
}
