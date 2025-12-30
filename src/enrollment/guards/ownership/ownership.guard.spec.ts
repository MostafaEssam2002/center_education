import { OwnershipGuard } from './ownership.guard';

describe('OwnershipGuard', () => {
  it('should be defined', () => {
    expect(new OwnershipGuard()).toBeDefined();
  });
});
