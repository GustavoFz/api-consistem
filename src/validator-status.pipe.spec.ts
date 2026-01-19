import { BadRequestException } from '@nestjs/common';
import { ValidatorStatus } from './validator-status.pipe';

describe('ValidatorStatus', () => {
  let pipe: ValidatorStatus;

  beforeEach(() => {
    pipe = new ValidatorStatus();
  });

  it('returns undefined when status is missing', () => {
    expect(pipe.transform(undefined)).toBeUndefined();
  });

  it('returns status when it is 0 or 1', () => {
    expect(pipe.transform('0')).toBe(0);
    expect(pipe.transform(1)).toBe(1);
  });

  it('throws when status is invalid', () => {
    expect(() => pipe.transform('2')).toThrow(BadRequestException);
  });
});
