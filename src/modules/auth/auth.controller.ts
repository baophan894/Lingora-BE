import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local.guard';
import { JwtRefreshTokenGuard } from './guards/jwt-refresh-token.guard';

import {
	ApiBadRequestResponse,
	ApiBearerAuth,
	ApiBody,
	ApiConflictResponse,
	ApiCreatedResponse,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import { GoogleAuthGuard } from './guards/google-oauth.guard';


import { access_token_public_key } from 'src/constraints/jwt.constraint';
import { SignInDto } from './dto/sign-in.dto';
import { VerifiedOTPDto } from './dto/verified-otp';
import { SignInTokenDto } from './dto/sign-in-token.dto';
import { JwtAccessTokenGuard } from './guards/jwt-access-token.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { RolesEnum } from 'src/enums/roles..enum';
import { SendOTPDto } from './dto/send-otp';
import { use } from 'passport';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifiedOtpDTO } from './dto/verify-otp.dto';
import { SignUpDto } from './dto/sign-up.dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
	constructor(private readonly auth_service: AuthService) { }

	@Post('google')
	async authWithGoogle(@Body() sign_in_token: SignInTokenDto) {
		return this.auth_service.authenticateWithGoogle(sign_in_token);
	}

	@UseGuards(GoogleAuthGuard)
	@Get('google/callback')
	@ApiResponse({
		status: 401,
		description: 'Unauthorized',
		content: {
			'application/json': {
				example: {
					statusCode: 400,
					message: 'Wrong credentials!!',
					error: 'Bad Request!',
				},
			},
		},
	})
	async authWithGoogleCallback(@Req() request) {
		return request.user;
	}

	@Post('sign-up')
	@ApiOperation({ summary: 'sign up with student' })
	async signUpWithStudent(@Body() sign_up_with_std_dto: SignUpDto) {
		return await this.auth_service.signUp(sign_up_with_std_dto);
	}

	@Post('sign-in')
	@ApiOperation({ summary: 'sign in' })
	async signIn(@Body() sign_in_dto: SignInDto) {
		return await this.auth_service.signIn(sign_in_dto);
	}

	@Get('get-access-token')
	@ApiOperation({ summary: 'get access token' })
	@UseGuards(JwtRefreshTokenGuard, RolesGuard)
	getAccessToken(@Req() req) {
		return this.auth_service.getAccessToken(req.user);
	}

}
