import { UserService } from '@modules/users/users.service';
// import { JwtRefreshTokenStrategy } from './strategies/jwt-refresh-token.strategy';
import { JwtAccessTokenStrategy } from './strategies/jwt-access-token.strategy';
import { JwtRefreshTokenStrategy } from './strategies/jwt-refresh-token.strategy';
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { MailerModule } from '@nestjs-modules/mailer';
import { ResetTokenService } from '@modules/reset-token/reset-token.service';
import { ResetTokenModule } from '@modules/reset-token/reset-token.module';
import { UserModule } from '@modules/users/users.module';
import { GoogleStrategy } from './strategies/google.strategy';

@Module({
	imports: [
		UserModule,
		
		PassportModule,
		JwtModule.register({}),
		HttpModule,
		ResetTokenModule,
		MailerModule.forRoot({
			transport: {
				host: 'smtp.gmail.com',
				auth: {
					user: 'safeedushared@gmail.com',
					pass: 'rjif qqcy osej algo',
				},
			},
		}),
	],
	controllers: [AuthController],
	providers: [
		AuthService,
		LocalStrategy,
		JwtAccessTokenStrategy,
		JwtRefreshTokenStrategy,
		UserService,
		GoogleStrategy,
		ResetTokenService,
	],
})
export class AuthModule {}
