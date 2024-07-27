import {
  IsBoolean, IsOptional, IsString,
} from 'class-validator'

export class PutUserReqDto {
  @IsString()
  @IsOptional()
    firstName?: string

  @IsString()
  @IsOptional()
    lastName?: string

  @IsBoolean()
  @IsOptional()
    isActive?: boolean

  @IsString({ each: true })
  @IsOptional()
    roles?: string[]

  constructor (dto: PutUserReqDto) {
    this.roles = dto.roles
    this.isActive = dto.isActive
    this.firstName = dto.firstName
    this.lastName = dto.lastName
  }
}
