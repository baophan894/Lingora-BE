import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as Joi from 'joi';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { database_config } from './configs/configuration.config';
import { APP_FILTER } from '@nestjs/core';
import { GlobalExceptionFilter } from './exception-filters/global-exception.filter';
import * as mongoose from 'mongoose';
import { UserModule } from '@modules/users/users.module';
import { ChatModule } from './modules/chat/chat.module';
import { ChatService } from '@modules/chat/chat.service';
import { AuthModule } from '@modules/auth/auth.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { RegistrationModule } from './modules/course-registration/registration.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			validationSchema: Joi.object({
				NODE_ENV: Joi.string()
					.valid('development', 'production', 'test', 'provision')
					.default('development'),
				PORT: Joi.number().port().required(),
				DATABASE_PORT: Joi.number().port().optional(),
				DATABASE_USERNAME: Joi.string().min(4).required(),
				DATABASE_PASSWORD: Joi.string().min(4).required(),
				DATABASE_HOST: Joi.string().required(),
				DATABASE_URI: Joi.string().required(),
				STRIPE_SECRET_KEY: Joi.string().required(),
				STRIPE_WEBHOOK_SECRET: Joi.string().required(),
				FRONTEND_URL: Joi.string().required(),
			}),
			validationOptions: {
				abortEarly: false,
			},
			load: [database_config],
			isGlobal: true,
			cache: true,
			expandVariables: true,
			envFilePath: process.env.NODE_ENV === 'development' ? '.env.dev' : '.env',
		}),
		MongooseModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: async (configService: ConfigService) => {
				const uri = configService.get<string>('DATABASE_URI');
				const dbName = configService.get<string>('DATABASE_NAME');
				// Log MongoDB queries
				mongoose.set('debug', true);
				return {
					uri,
					dbName,
				};
			},
			inject: [ConfigService],
		}),
		AuthModule,
		UserModule,
		ChatModule,
		PaymentsModule,
		RegistrationModule,
	],
	controllers: [AppController],
	providers: [
		AppService,
		{
			provide: APP_FILTER,
			useClass: GlobalExceptionFilter,
		},
		ChatService,
	],
})
export class AppModule {}
