import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ValidatorStatus implements PipeTransform<any> {
  transform(status: any): number | undefined {
    if (status === undefined) {
      return undefined;
    }

    const statusNumber = Number(status);
    if (
      !Number.isInteger(statusNumber) ||
      (statusNumber !== 0 && statusNumber !== 1)
    ) {
      throw new BadRequestException('Status must be 0 or 1.');
    }

    return statusNumber;
  }
}
