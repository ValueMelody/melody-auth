import {
  IsNotEmpty, IsOptional, IsString, Length,
} from 'class-validator'

export class PostOrgReqDto {
  @IsString()
  @Length(
    1,
    50,
  )
  @IsNotEmpty()
    name: string

  constructor (dto: PostOrgReqDto) {
    this.name = dto.name.trim()
  }
}

export class PutOrgReqDto {
  @IsString()
  @Length(
    1,
    50,
  )
  @IsOptional()
    name: string

  @IsString()
  @Length(
    0,
    250,
  )
  @IsOptional()
    companyLogoUrl: string

  @IsString()
  @Length(
    0,
    50,
  )
  @IsOptional()
    fontFamily: string

  @IsString()
  @Length(
    0,
    250,
  )
  @IsOptional()
    fontUrl: string

  @IsString()
  @Length(
    0,
    20,
  )
  @IsOptional()
    layoutColor: string

  @IsString()
  @Length(
    0,
    20,
  )
  @IsOptional()
    labelColor: string

  @IsString()
  @Length(
    0,
    20,
  )
  @IsOptional()
    primaryButtonColor: string

  @IsString()
  @Length(
    0,
    20,
  )
  @IsOptional()
    primaryButtonLabelColor: string

  @IsString()
  @Length(
    0,
    20,
  )
  @IsOptional()
    primaryButtonBorderColor: string

  @IsString()
  @Length(
    0,
    20,
  )
  @IsOptional()
    secondaryButtonColor: string

  @IsString()
  @Length(
    0,
    20,
  )
  @IsOptional()
    secondaryButtonLabelColor: string

  @IsString()
  @Length(
    0,
    20,
  )
  @IsOptional()
    secondaryButtonBorderColor: string

  @IsString()
  @Length(
    0,
    20,
  )
  @IsOptional()
    criticalIndicatorColor: string

  @IsString()
  @Length(
    0,
    20,
  )
  @IsOptional()
    emailSenderName: string

  @IsString()
  @Length(
    0,
    250,
  )
  @IsOptional()
    termsLink: string

  @IsString()
  @Length(
    0,
    250,
  )
  @IsOptional()
    privacyPolicyLink: string

  constructor (dto: PutOrgReqDto) {
    this.name = dto.name?.trim()
    this.companyLogoUrl = dto.companyLogoUrl
    this.fontFamily = dto.fontFamily
    this.fontUrl = dto.fontUrl
    this.layoutColor = dto.labelColor
    this.labelColor = dto.labelColor
    this.primaryButtonColor = dto.primaryButtonColor
    this.primaryButtonLabelColor = dto.primaryButtonLabelColor
    this.primaryButtonBorderColor = dto.primaryButtonBorderColor
    this.secondaryButtonColor = dto.secondaryButtonColor
    this.secondaryButtonLabelColor = dto.secondaryButtonLabelColor
    this.secondaryButtonBorderColor = dto.secondaryButtonBorderColor
    this.criticalIndicatorColor = dto.criticalIndicatorColor
    this.emailSenderName = dto.emailSenderName
    this.termsLink = dto.termsLink
    this.privacyPolicyLink = dto.privacyPolicyLink
  }
}
