import {
  IsNotEmpty, IsOptional, IsString, Length, IsBoolean,
} from 'class-validator'

export class PostSamlIdpDto {
  @IsString()
  @Length(
    1,
    50,
  )
  @IsNotEmpty()
    name: string

  @IsString()
  @IsNotEmpty()
    userIdAttribute: string

  @IsString()
  @IsOptional()
    emailAttribute: string | null

  @IsString()
  @IsOptional()
    firstNameAttribute: string | null

  @IsString()
  @IsOptional()
    lastNameAttribute: string | null

  @IsString()
  @IsNotEmpty()
    metadata: string

  constructor (dto: PostSamlIdpDto) {
    this.name = dto.name?.trim()
    this.userIdAttribute = dto.userIdAttribute?.trim()
    this.emailAttribute = dto.emailAttribute?.trim() || null
    this.firstNameAttribute = dto.firstNameAttribute?.trim() || null
    this.lastNameAttribute = dto.lastNameAttribute?.trim() || null
    this.metadata = dto.metadata?.trim()
  }
}

export class PutSamlIdpDto {
  @IsBoolean()
  @IsOptional()
    isActive?: boolean

  @IsString()
  @IsOptional()
    userIdAttribute?: string

  @IsString()
  @IsOptional()
    emailAttribute?: string | null

  @IsString()
  @IsOptional()
    firstNameAttribute?: string | null

  @IsString()
  @IsOptional()
    lastNameAttribute?: string | null

  @IsString()
  @IsOptional()
    metadata?: string

  constructor (dto: PutSamlIdpDto) {
    this.isActive = dto.isActive ?? undefined
    this.userIdAttribute = dto.userIdAttribute?.trim()
    this.emailAttribute = dto.emailAttribute
    this.firstNameAttribute = dto.firstNameAttribute
    this.lastNameAttribute = dto.lastNameAttribute
    this.metadata = dto.metadata?.trim()
  }
}
