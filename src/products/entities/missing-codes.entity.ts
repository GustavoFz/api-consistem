import { ApiProperty } from '@nestjs/swagger';

export class MissingCodesEntity {
  @ApiProperty({ example: 3 })
  missingCode: number;

  @ApiProperty({ example: 'Produto não cadastrado' })
  status: string;
}

export class MissingCodesResponseEntity {
  @ApiProperty({ example: 100 })
  lastCode: number;

  @ApiProperty({ example: [3, 7, 15] })
  missingCodes: number[];

  @ApiProperty({ example: 3 })
  totalMissing: number;
}
