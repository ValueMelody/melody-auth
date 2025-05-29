import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator'

interface AttributeLocale {
  locale: string;
  value: string;
}

export class PostUserAttributeDto {
  @IsString()
  @Length(
    1,
    50,
  )
  @IsNotEmpty()
    name: string

  @IsArray()
  @IsOptional()
    locales?: AttributeLocale[]

  @IsBoolean()
  @IsNotEmpty()
    includeInSignUpForm: boolean

  @IsBoolean()
  @IsNotEmpty()
    requiredInSignUpForm: boolean

  @IsBoolean()
  @IsNotEmpty()
    includeInIdTokenBody: boolean

  @IsBoolean()
  @IsNotEmpty()
    includeInUserInfo: boolean

  constructor (dto: PostUserAttributeDto) {
    this.name = dto.name?.trim()
    this.includeInSignUpForm = dto.includeInSignUpForm
    this.requiredInSignUpForm = dto.requiredInSignUpForm
    this.includeInIdTokenBody = dto.includeInIdTokenBody
    this.includeInUserInfo = dto.includeInUserInfo
    this.locales = dto.locales
  }
}

export class PutUserAttributeDto {
  @IsString()
  @Length(
    1,
    50,
  )
  @IsOptional()
    name: string

  @IsArray()
  @IsOptional()
    locales?: AttributeLocale[]

  @IsBoolean()
  @IsOptional()
    includeInSignUpForm: boolean

  @IsBoolean()
  @IsOptional()
    requiredInSignUpForm: boolean

  @IsBoolean()
  @IsOptional()
    includeInIdTokenBody: boolean

  @IsBoolean()
  @IsOptional()
    includeInUserInfo: boolean

  constructor (dto: PutUserAttributeDto) {
    this.name = dto.name?.trim()
    this.locales = dto.locales
    this.includeInSignUpForm = dto.includeInSignUpForm
    this.requiredInSignUpForm = dto.requiredInSignUpForm
    this.includeInIdTokenBody = dto.includeInIdTokenBody
    this.includeInUserInfo = dto.includeInUserInfo
  }
}
