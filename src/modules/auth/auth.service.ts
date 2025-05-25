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
import { UserService } from '@modules/users/users.service';
import { SignUpDto, SignUpGoogleDto } from './dto/sign-up.dto';
import { UserRepository } from '@repositories/user.repository';
import { SignInTokenDto } from './dto/sign-in-token.dto';
import { USER_ROLE } from '@modules/users/entities/users.entity';
@Injectable()
export class AuthService {
	private SALT_ROUND = 11;
	constructor(
		private config_service: ConfigService,

		private readonly user_service: UserService,
		private readonly userRepository: UserRepository,
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

	async authInWithGoogle(sign_up_dto: SignUpGoogleDto) {
		try {
			let user = await this.userRepository.findOneByCondition({ email: sign_up_dto.email });
			const fullName = `${sign_up_dto.first_name} ${sign_up_dto.last_name}`;
			if (!user) {
				user = await this.userRepository.create({
					email: sign_up_dto.email,
					fullName: fullName,
					role: USER_ROLE.STUDENT, 
					isActive: true,
					avatarUrl: sign_up_dto.avatar,
					gender: sign_up_dto.gender,
				});
			}

			if (!user.isActive) {
				throw new HttpException(
					{ message: 'Tài khoản đã bị khóa', error: 'Unauthorized' },
					HttpStatus.UNAUTHORIZED,
				);
			}

			return await this.signInUser(user._id.toString());
		} catch (error) {
			console.error('Auth error:', error);
			throw new BadRequestException({
				statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
				error: error.message,
				message: 'Có lỗi xảy ra, vui lòng thử lại sau',
			});
		}
	}


	async authenticateWithGoogle(sign_in_token: SignInTokenDto) {
		try {
			const { token, avatar } = sign_in_token;
			const decodedToken = this.jwt_service.decode(token) as { email: string };

			if (!decodedToken?.email) {
				throw new HttpException(
					{ message: 'Token không hợp lệ', error: 'Bad Request' },
					HttpStatus.BAD_REQUEST,
				);
			}

			const email = decodedToken.email;

			const user = await this.userRepository.findOneByCondition({ email });

			if (!user) {
				throw new HttpException(
					{ message: 'Không tìm thấy người dùng', error: 'Unauthorized' },
					HttpStatus.UNAUTHORIZED,
				);
			}

			if (!user.isActive) {
				throw new HttpException(
					{ message: 'Tài khoản của bạn đã bị khóa', error: 'Unauthorized' },
					HttpStatus.UNAUTHORIZED,
				);
			}

			if (avatar && user.avatarUrl !== avatar) {
				await this.user_service.update(user.id, { avatarUrl: avatar });
			}

			const accessToken = this.generateAccessToken({
				userId: user.id,
				role: user.role,
			});

			const refreshToken = this.generateRefreshToken({
				userId: user.id,
				role: user.role,
			});

			return {
				accessToken,
				refreshToken,
				fullName: user.fullName,
				role: user.role,
			};
		} catch (error) {
			throw new BadRequestException({
				statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
				error: error.message,
				message: 'Có lỗi xảy ra, vui lòng thử lại sau',
			});
		}
	}

	async signIn(signInDto: SignInDto) {
		const { email, password } = signInDto;
		console.log('email', email);
		console.log('password', password);

		const user = await this.userRepository.findOneByCondition({ email: email });
		console.log('user', user);
		if (!user) {
			throw new BadRequestException({
				message: 'User not found',
				details: 'Email not found',
			});
		}

		const isPasswordMatched = await bcrypt.compare(password, user.passwordHash);
		if (!isPasswordMatched) {
			throw new BadRequestException({
				message: 'Password not matched',
				details: 'Incorrect password',
			});
		}

		if (user.status !== 'active') {
			throw new BadRequestException({
				message: 'User is not active',
				details: 'Account is locked or inactive',
			});
		}
		
		const refresh_token = this.generateRefreshToken({
			userId: user._id.toString(),
			role: user.role,
		});

		await this.storeRefreshToken(user._id.toString(), refresh_token);

		return {
			user: {
				_id: user._id,
				email: user.email,
				fullName: user.fullName,
				avatarUrl: user.avatarUrl,	
				role: user.role,
				gender: user.gender || null,
				phone_number: user.phone_number,
				date_of_birth: user.date_of_birth,
				address: user.address || null,
				profile: user.profile || {},
				status: user.status,
			},
			access_token: this.generateAccessToken({
				userId: user._id.toString(),
				role: user.role,
			}),
			refresh_token,
		};
	}

	async signUp(signUpDto: SignUpDto) {
		const { email, password, fullName, gender, phone_number, date_of_birth, role } = signUpDto;

		const existingUser = await this.userRepository.findOneByCondition({ email });
		if (existingUser) {
			throw new BadRequestException({
				message: 'Email already exists',
				details: 'A user with this email already exists',
			});
		}

		const passwordHash = await bcrypt.hash(password, 10);

		const createdUser = await this.userRepository.create({
			email,
			passwordHash,
			fullName,
			gender,
			phone_number,
			date_of_birth,
			role, // chắc chắn set user active luôn
		});

		// Tạo token giống như trong signIn
		const refresh_token = this.generateRefreshToken({
			userId: createdUser._id.toString(),
			role: createdUser.role,
		});

		await this.storeRefreshToken(createdUser._id.toString(), refresh_token);

		return {
			message: 'User registered and logged in successfully',
			userId: createdUser._id,
			access_token: this.generateAccessToken({
				userId: createdUser._id.toString(),
				role: createdUser.role,
			}),
			refresh_token,
		};
	}

	async signInUser(_id: string) {
		const user = await this.user_service.findOneByCondition({ _id });
		if (user) {
			const access_token = this.generateAccessToken({
				userId: user._id.toString(),
				role: user.role,
			});
			const refresh_token = this.generateRefreshToken({
				userId: user._id.toString(),
				role: user.role,
			});

			return {
				access_token,
				refresh_token,
			};
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
