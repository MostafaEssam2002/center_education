import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CaslAbilityFactory } from '../../casl/casl-ability.factory';
import { CHECK_POLICIES_KEY } from '../../decorators/policies.decorator';

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(private reflector: Reflector,private caslAbilityFactory: CaslAbilityFactory,) {}
  canActivate(context: ExecutionContext): boolean {
    const policyHandlers = this.reflector.get(CHECK_POLICIES_KEY, context.getHandler()) || [];
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const ability = this.caslAbilityFactory.createForUser(user);
    return policyHandlers.every((handler) =>
      handler(ability),
    );
  }
}
