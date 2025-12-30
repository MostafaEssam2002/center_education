import { Injectable } from '@nestjs/common';
import {
  AbilityBuilder,
  createMongoAbility,
  MongoAbility,
} from '@casl/ability';
import { User } from '@prisma/client';

export type Actions = 'manage' | 'create' | 'read' | 'update' | 'delete';
export type Subjects = 'User' | 'all';

export type AppAbility = MongoAbility<[Actions, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User): AppAbility {
    const { can, cannot, build } =
      new AbilityBuilder<AppAbility>(createMongoAbility);

    if (user.role === 'ADMIN') {
      can('manage', 'all');
    } else if (user.role === 'TEACHER') {
      can('read', 'User');
    } else {
      cannot('manage', 'all');
    }

    return build(); // ✅ كده تمام
  }
}
