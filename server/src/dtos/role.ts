import {
  IsNotEmpty, IsOptional, IsString, Length,
} from 'class-validator'

export class PostRoleDto {
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

  constructor (dto: PostRoleDto) {
    this.name = dto.name.trim()
    this.note = dto.note || ''
  }
}

export class PutRoleDto {
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

  constructor (dto: PutRoleDto) {
    this.name = dto.name?.trim()
    this.note = dto.note
  }
}
