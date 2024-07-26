import {
  IsEnum,
  IsNotEmpty, IsString, Length,
} from 'class-validator'
import { ClientType } from 'shared'

export class PutScopeReqDto {
  @IsString()
  @Length(
    1,
    50,
  )
  @IsNotEmpty()
    name: string

  constructor (dto: PutScopeReqDto) {
    this.name = dto.name.trim()
  }
}

export class PostScopeReqDto extends PutScopeReqDto {
  @IsEnum(ClientType)
    type: ClientType

  constructor (dto: PostScopeReqDto) {
    super(dto)
    this.type = dto.type
  }
}
