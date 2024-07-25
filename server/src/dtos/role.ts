import {
  IsNotEmpty, IsString, Length,
} from 'class-validator'

export class PostRoleReqDto {
  @IsString()
  @Length(
    1,
    50,
  )
  @IsNotEmpty()
    name: string

  constructor (dto: PostRoleReqDto) {
    this.name = dto.name.trim()
  }
}

export class PutRoleReqDto extends PostRoleReqDto {}
