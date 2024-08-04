import {
  IsNotEmpty, IsOptional, IsString, Length,
} from 'class-validator'

export class PostRoleReqDto {
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

  constructor (dto: PostRoleReqDto) {
    this.name = dto.name.trim()
    this.note = dto.note || ''
  }
}

export class PutRoleReqDto {
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

  constructor (dto: PutRoleReqDto) {
    this.name = dto.name?.trim()
    this.note = dto.note
  }
}
