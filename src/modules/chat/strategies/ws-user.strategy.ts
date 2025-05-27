import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '@modules/users/entities/users.entity';
import { UserService } from '@modules/users/users.service';
import { UserRepository } from '@repositories/user.repository';
import { access_token_public_key } from 'src/constraints/jwt.constraint';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly userService: UserService,
    private readonly userRepository: UserRepository,
  ) {
    super({
      jwtFromRequest: (req) => {
        if (req?.handshake?.auth?.token) {
          return req.handshake.auth.token; 
        }
        return ExtractJwt.fromAuthHeaderAsBearerToken()(req);
      },
      ignoreExpiration: false,
      secretOrKey: access_token_public_key,
    });
  }

  async validate(payload): Promise<User> {
    console.log('🔑 Payload:', payload);
    const user = await this.userService.findById(payload.userId);
    if (!user) {
      throw new Error('Invalid token');
    }
    return user;
  }
}