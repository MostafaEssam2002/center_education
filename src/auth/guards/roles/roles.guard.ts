// import { Role } from '../../../user/enum/role.enum';
// import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// // import { Role } from 'src/auth/enums/role.enum';
// import { ROLES_KEY } from 'src/auth/decorators/roles.decorator';

// @Injectable()
// export class RolesGuard implements CanActivate {
//   constructor(private reflector: Reflector) {}

//   canActivate(context: ExecutionContext): boolean {
//     const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
//       ROLES_KEY,
//       [context.getHandler(), context.getClass()],
//     );

//     // ✅ لو مفيش Roles → مسموح
//     if (!requiredRoles || requiredRoles.length === 0) {
//       return true;
//     }

//     const request = context.switchToHttp().getRequest();
//     const user = request.user;

//     if (!user || !user.role) return false;

//     return requiredRoles.includes(user.role);
//   }
// }

import { Reflector } from '@nestjs/core';
import {CanActivate,ExecutionContext,Injectable, } from '@nestjs/common';
import { ROLES_KEY } from '../../../auth/decorators/roles.decorator';
// import { Role } from '../../../user/enum/role.enum';
import { Role } from '@prisma/client';
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    
    // لو مفيش roles محددة → اسمح
    if (requiredRoles.length<=0) {
      // console.log('requiredRoles:', requiredRoles);
      // console.log('user.role:', user?.role);
      // console.log("length of required roles is ",requiredRoles.length)
      return true;

    }
    
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    // console.log('requiredRoles:', requiredRoles);
    // console.log('user.role:', user?.role);
    // console.log("length of required roles is ",requiredRoles.length)
    if (!user || !user.role) return false;
      return requiredRoles.includes(user.role);
      }
}
