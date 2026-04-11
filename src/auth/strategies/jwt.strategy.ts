import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

function getCookieValue(cookieHeader: string | undefined, name: string): string | null {
    if (!cookieHeader) return null;
    // Very small parser: "a=1; b=2" -> pick b
    const parts = cookieHeader.split(';').map((p) => p.trim());
    const hit = parts.find((p) => p.startsWith(`${name}=`));
    if (!hit) return null;
    return decodeURIComponent(hit.slice(name.length + 1));
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        const jwtSecret = process.env.JWT_SECRET;
        // console.log('jwtSecret = ',jwtSecret)
        if (!jwtSecret) {
            throw new Error('JWT_SECRET is not defined');
        }
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                // Backwards-compatible: still accept Authorization: Bearer <token>
                ExtractJwt.fromAuthHeaderAsBearerToken(),
                // Cookie-based auth (preferred)
                (req: any) => getCookieValue(req?.headers?.cookie, 'authToken') || getCookieValue(req?.headers?.cookie, 'access_token'),
            ]),
            secretOrKey: jwtSecret
            // secretOrKey: process.env.JWT_SECRET || 'SECRET_KEY',
        });
    }
    async validate(payload: any) {
        return { id: payload.sub, role: payload.role, email: payload.email };
    }
}
