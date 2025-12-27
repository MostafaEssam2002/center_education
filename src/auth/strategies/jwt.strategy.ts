import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        const jwtSecret = process.env.JWT_SECRET;
        // console.log('jwtSecret = ',jwtSecret)
        if (!jwtSecret) {
            throw new Error('JWT_SECRET is not defined');
        }
        super({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: jwtSecret 
        // secretOrKey: process.env.JWT_SECRET || 'SECRET_KEY',
        });
    }
    async validate(payload: any){
        return { userId: payload.sub,role:payload.role ,email: payload.email };
    }
}
