import {
  IsNumber, Min,
} from 'class-validator'

export class PaginationDto {
  @IsNumber()
  @Min(1)
    pageNumber: number

  @IsNumber()
  @Min(1)
    pageSize: number

  constructor (dto: PaginationDto) {
    this.pageNumber = dto.pageNumber
    this.pageSize = dto.pageSize
  }
}
