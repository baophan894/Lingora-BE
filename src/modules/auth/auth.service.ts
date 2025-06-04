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
import { EmailService } from '@modules/email/email.service';
import { v4 as uuidv4 } from 'uuid';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class AuthService {
	private SALT_ROUND = 11;
	constructor(
		private config_service: ConfigService,

		private readonly http_service: HttpService,
		private readonly user_service: UserService,
		private readonly userRepository: UserRepository,
		private readonly jwt_service: JwtService,
		private readonly emailService: EmailService,
	) {}
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
			let user = await this.userRepository.findOneByCondition({
				email: sign_up_dto.email,
			});
			const fullName = `${sign_up_dto.first_name} ${sign_up_dto.last_name}`;
			if (!user) {
				user = await this.userRepository.create({
					email: sign_up_dto.email,
					fullName: fullName,
					role: USER_ROLE.STUDENT,
					isActive: true,
					avatarUrl:
						sign_up_dto.avatar ||
						'https://res.cloudinary.com/dvcpy4kmm/image/upload/v1748274375/xtr9ktmr1loktzzl7m7f.svg',
					gender: sign_up_dto.gender,
				});
			}

			console.log('User từ back end', user);

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

			const userInfo = await this.http_service.axiosRef.get(
				'https://www.googleapis.com/oauth2/v3/userinfo',
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);

			const { email, name, picture } = userInfo.data;

			console.log('User info from Google:', userInfo.data);

			if (!email) {
				throw new HttpException(
					{ message: 'Token không hợp lệ', error: 'Bad Request' },
					HttpStatus.BAD_REQUEST,
				);
			}

			let user = await this.userRepository.findOneByCondition({ email });

			// Tạo user mới nếu chưa tồn tại
			if (!user) {
				const defaultPassword = '123456';
				const passwordHash = await bcrypt.hash(defaultPassword, 10); // 10 là salt rounds
				user = await this.userRepository.create({
					email,
					googleId: userInfo.data.sub,
					fullName:  userInfo.data.given_name,
					role: USER_ROLE.STUDENT,
					isActive: true,
					passwordHash,
					isVerified: userInfo.data.email_verified,
					
					avatarUrl: picture || avatar,
				});
			}

			if (!user.isActive) {
				throw new HttpException(
					{ message: 'Tài khoản đã bị khóa', error: 'Unauthorized' },
					HttpStatus.UNAUTHORIZED,
				);
			}

			// Cập nhật avatar nếu có thay đổi
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
				access_token: accessToken,
				refresh_token: refreshToken,
				user:user
			};
		} catch (error) {
			console.error('Google auth error:', error);
			throw new BadRequestException({
				statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
				error: error.message,
				message: 'Đăng nhập Google thất bại',
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

		if(user.isVerified === false) {
			throw new BadRequestException({
				message: 'User is not verified',
				details: 'Please verify your email before signing in',
			});
		}

		console.log('user.passwordHash', user.passwordHash);
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
		const {
			email,
			password,
			fullName,
			gender,
			phone_number,
			date_of_birth,
			role,
			avatarUrl,
		} = signUpDto;
		const existingUser = await this.userRepository.findOneByCondition({
			email,
		});
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
			role,
			avatarUrl:
				avatarUrl ||
				'https://res.cloudinary.com/dvcpy4kmm/image/upload/v1748274375/xtr9ktmr1loktzzl7m7f.svg',
		});

		// Tạo token giống như trong signIn
		const refresh_token = this.generateRefreshToken({
			userId: createdUser._id.toString(),
			role: createdUser.role,
		});

		await this.storeRefreshToken(createdUser._id.toString(), refresh_token);

		const token = uuidv4();
		console.log('token', token);
		createdUser.emailVerificationToken = token;
		await this.userRepository.update(createdUser.id, { emailVerificationToken: token });
		console.log('createUser',createdUser)
		await this.emailService.sendEmailVerification(createdUser.email, token);

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
