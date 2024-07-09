import {
  ArrayMinSize, IsEnum, IsString, Length,
} from 'class-validator'
import { HonoRequest } from 'hono'

enum GetAuthorizedReqQueryResponseType {
  Code = 'code',
}

export class GetAuthorizeReqQueryDto {
  @IsString()
  @Length(1)
    clientId: string

  @IsString()
  @Length(1)
    redirectUri: string

  @IsEnum(GetAuthorizedReqQueryResponseType)
    responseType: string

  @IsString()
  @Length(1)
    state: string

  @IsString({ each: true })
  @ArrayMinSize(1)
    scope: string[]

  constructor (req: HonoRequest) {
    this.clientId = req.query('client_id')?.toLowerCase() ?? ''
    this.redirectUri = req.query('redirect_uri')?.toLowerCase() ?? ''
    this.responseType = req.query('response_type')?.toLowerCase() ?? ''
    this.state = req.query('state')?.toLowerCase() ?? ''
    this.scope = req.queries('scope')?.map((val) => val.toLowerCase()) ?? []
  }
}
