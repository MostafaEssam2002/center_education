// import { SetMetadata } from '@nestjs/common';

// export const Roles = (...args: string[]) => SetMetadata('roles', args);
import { Role } from '@prisma/client';
import { SetMetadata } from '@nestjs/common';
// import { Role } from '../../user/enum/role.enum';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
