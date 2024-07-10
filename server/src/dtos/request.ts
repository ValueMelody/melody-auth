import {
  ArrayMinSize, IsEnum, IsString, IsEmail, IsStrongPassword, IsNotEmpty,
} from 'class-validator'

enum AuthorizeResponseType {
  Code = 'code',
}

export class GetAuthorizeReqQueryDto {
  @IsString()
  @IsNotEmpty()
    clientId: string

  @IsString()
  @IsNotEmpty()
    redirectUri: string

  @IsEnum(AuthorizeResponseType)
    responseType: string

  @IsString()
  @IsNotEmpty()
    state: string

  @IsString({ each: true })
  @ArrayMinSize(1)
    scope: string[]

  constructor (dto: GetAuthorizeReqQueryDto) {
    this.clientId = dto.clientId.toLowerCase()
    this.redirectUri = dto.redirectUri.toLowerCase()
    this.responseType = dto.responseType.toLowerCase()
    this.state = dto.state.toLowerCase()
    this.scope = dto.scope.map((val) => val.toLowerCase())
  }
}

export class PostAuthorizeReqBodyWithPasswordDto extends GetAuthorizeReqQueryDto {
  @IsEmail()
    email: string

  @IsStrongPassword()
    password: string

  constructor (dto: PostAuthorizeReqBodyWithPasswordDto) {
    super(dto)
    this.email = dto.email.toLowerCase()
    this.password = dto.password
  }
}
