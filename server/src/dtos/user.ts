import {
  IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, IsStrongPassword,
} from 'class-validator'

export class PostUserInvitationDto {
  @IsEmail()
    email: string

  @IsString()
  @IsOptional()
    firstName?: string

  @IsString()
  @IsOptional()
    lastName?: string

  @IsString()
  @IsOptional()
    locale?: string

  @IsString()
  @IsOptional()
    orgSlug?: string

  @IsString({ each: true })
  @IsOptional()
    roles?: string[]

  @IsString()
  @IsOptional()
    signinUrl?: string

  constructor (dto: PostUserInvitationDto) {
    this.email = dto.email?.trim().toLowerCase() ?? ''
    this.firstName = dto.firstName
    this.lastName = dto.lastName
    this.locale = dto.locale
    this.orgSlug = dto.orgSlug
    this.roles = dto.roles
    this.signinUrl = dto.signinUrl
  }
}

export class PostAcceptInvitationDto {
  @IsString()
  @IsNotEmpty()
    token: string

  @IsStrongPassword()
  @IsNotEmpty()
    password: string

  constructor (dto: PostAcceptInvitationDto) {
    this.token = dto.token?.trim() ?? ''
    this.password = dto.password ?? ''
  }
}

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

  @IsString()
  @IsOptional()
    orgSlug?: string

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
    this.orgSlug = dto.orgSlug
  }
}
