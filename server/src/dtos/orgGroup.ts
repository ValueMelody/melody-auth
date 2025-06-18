import {
  IsNotEmpty, IsNumber, IsString, Length,
} from 'class-validator'

export class PostOrgGroupDto {
  @IsString()
  @Length(
    1,
    50,
  )
  @IsNotEmpty()
    name: string

  @IsNumber()
  @IsNotEmpty()
    orgId: number

  constructor (dto: PostOrgGroupDto) {
    this.name = dto.name?.trim()
    this.orgId = dto.orgId
  }
}

export class PutOrgGroupDto {
  @IsString()
  @Length(
    1,
    50,
  )
  @IsNotEmpty()
    name: string

  constructor (dto: PutOrgGroupDto) {
    this.name = dto.name?.trim()
  }
}
