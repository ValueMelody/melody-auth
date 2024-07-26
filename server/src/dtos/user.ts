import { IsString } from 'class-validator'

export class PutUserRolesReqDto {
  @IsString({ each: true })
    roles: string[]

  constructor (dto: PutUserRolesReqDto) {
    this.roles = dto.roles.map((role) => role.trim().toLowerCase())
  }
}
