import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
	BadRequestException,
	ConflictException,
	ConsoleLogger,
	HttpException,
	HttpStatus,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
// OUTER
import { TokenPayload } from './interfaces/token.interface';
import {
	access_token_private_key,
	refresh_token_private_key,
} from 'src/constraints/jwt.constraint';
import { ERRORS_DICTIONARY } from 'src/constraints/error-dictionary.constraint';
import { SignInDto } from './dto/sign-in.dto';
import { UserService } from '@modules/students/users.service';
import { SignUpDto } from './dto/sign-up.dto';
@Injectable()
export class AuthService {
	private SALT_ROUND = 11;
	constructor(
		private config_service: ConfigService,

		private readonly user_service: UserService,

		private readonly jwt_service: JwtService,

	) { }
	generateAccessToken(payload: TokenPayload) {
		return this.jwt_service.sign(payload, {
			algorithm: 'RS256',
			privateKey: access_token_private_key,
			expiresIn: `${this.config_service.get<string>(
				'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
			)}s`,
		});
	}

	generateRefreshToken(payload: TokenPayload) {
		return this.jwt_service.sign(payload, {
			algorithm: 'RS256',
			privateKey: refresh_token_private_key,
			expiresIn: `${this.config_service.get<string>(
				'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
			)}s`,
		});
	}

	

	async storeRefreshToken(_id: string, token: string): Promise<void> {
		try {
			const hashed_token = await bcrypt.hash(token, this.SALT_ROUND);
			await this.user_service.setCurrentRefreshToken(_id, hashed_token);
		} catch (error) {
			throw error;
		}
	}


	async signIn(sign_in_dto: SignInDto) {
		const { username, password } = sign_in_dto;
		const normalizedUsername = username.toLowerCase()
		const existed_user_username = await this.user_service.findOneByCondition({ username: normalizedUsername });
		

		if (existed_user_username) {
			const is_password_matched = await bcrypt.compare(
				password,
				existed_user_username.password,
			);

			if (!existed_user_username.isActive)
				throw new BadRequestException({
					message: ERRORS_DICTIONARY.USER_NOT_ACTIVE,
					details: 'User not active',
				});

			if (!is_password_matched) {
				throw new BadRequestException({
					message: ERRORS_DICTIONARY.PASSWORD_NOT_MATCHED,
					details: 'Password not matched',
				});
			}
			const refresh_token = this.generateRefreshToken({
				userId: existed_user_username._id.toString(),
				role: 'user',
			});
			await this.storeRefreshToken(
				existed_user_username._id.toString(),
				refresh_token,
			);

			
			return {
				access_token: this.generateAccessToken({
					userId: existed_user_username._id.toString(),
					role: 'user',
				}),
				refresh_token,
			};
		
		}
		throw new BadRequestException({
			message: ERRORS_DICTIONARY.USER_NOT_FOUND,
			details: 'Username not found',
		});
	}

	async signUp(sign_up_dto: SignUpDto) {
		try {
			const {
				first_name,
				last_name,
				phone_number,
				organizationId,
				username,
				email,
				date_of_birth,
				password,
			} = sign_up_dto;
			const normalizedUsername = username.toLowerCase()
			const user = await this.user_service.create({
				first_name,
				last_name,
				date_of_birth,
				phone_number,
				email,
				username: normalizedUsername,
				password,
		
			});

			const refresh_token = this.generateRefreshToken({
				userId: user._id.toString(),
				role: 'user',
			});
			try {
				await this.storeRefreshToken(
					user._id.toString(),
					refresh_token,
				);
				return {
					access_token: this.generateAccessToken({
						userId: user._id.toString(),
						role: 'user',
					}),
					refresh_token,
				};
			} catch (error) {
				console.error(
					'Error storing refresh token or generating access token:',
					error,
				);
				throw new Error(
					'An error occurred while processing tokens. Please try again.',
				);
			}
		} catch (error) {
			throw error;
		}
	}

	



	
	async getAccessToken(user: TokenPayload): Promise<{
		access_token: string;
		refresh_token: string;
	}> {
		const { userId, role } = user;
		const access_token = this.generateAccessToken({ userId, role });
		const refresh_token = this.generateRefreshToken({ userId, role });
		return {
			access_token,
			refresh_token,
		};
	}

	



	

	

	
}
