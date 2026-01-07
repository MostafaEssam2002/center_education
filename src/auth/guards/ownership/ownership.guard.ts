import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Observable } from 'rxjs';

@Injectable()
export class OwnershipGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    if(request.user.role!==Role.ADMIN && request.user.id!== +request.params.id){
      throw new ForbiddenException('Access denied');
    }
    return true;
  }
}
