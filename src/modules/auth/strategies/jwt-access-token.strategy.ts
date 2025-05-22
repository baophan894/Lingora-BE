import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenPayload } from '../interfaces/token.interface';
import { access_token_public_key } from 'src/constraints/jwt.constraint';



import { UnauthorizedException } from '@nestjs/common';
import { UserService } from '@modules/students/users.service';

@Injectable()
export class JwtAccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
	constructor(
		private readonly userService: UserService,
	
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: access_token_public_key,
		});
	}

	async validate(payload: TokenPayload) {
		const { userId, role } = payload;
				const user = await this.userService.findById(userId);
				if (!user) {
					throw new UnauthorizedException(
						'Quyền truy cập bị từ chối: Không tìm thấy học sinh.',
					);
				}
				// if (!user.isActive) {
				// 	throw new UnauthorizedException(
				// 		'Quyền truy cập bị từ chối: Tài khoản của bạn đã bị khóa.',
				// 	);
				// }

				// If all checks pass, return the payload
				return payload;
	}
}
