import {
  IsBoolean, IsOptional, IsString,
} from 'class-validator'

export class PutUserDto {
  @IsString()
  @IsOptional()
    firstName?: string

  @IsString()
  @IsOptional()
    lastName?: string

  @IsString()
  @IsOptional()
    locale?: string

  @IsBoolean()
  @IsOptional()
    isActive?: boolean

  @IsString({ each: true })
  @IsOptional()
    roles?: string[]

  constructor (dto: PutUserDto) {
    this.roles = dto.roles
    this.isActive = dto.isActive
    this.firstName = dto.firstName
    this.lastName = dto.lastName
    this.locale = dto.locale
  }
}
