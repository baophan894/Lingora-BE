import { Request } from 'express';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { refresh_token_public_key } from 'src/constraints/jwt.constraint';

import { TokenPayload } from '../interfaces/token.interface';
import { UserRepository } from '@repositories/user.repository';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(Strategy, 'refresh_token') {
  constructor(
    private readonly userRepository: UserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: refresh_token_public_key,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: TokenPayload) {
    const { userId, role } = payload;
    const { ...newPayload } = payload;

    if (role !== 'User') {
      throw new UnauthorizedException('Vai trò không hợp lệ.');
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Không tìm thấy người dùng.');
    }

    return newPayload; // return validated payload without exp
  }
}
