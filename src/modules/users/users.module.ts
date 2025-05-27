
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchemaFactory } from './entities/users.entity';
import { UserController } from './users.controller';
import { UserService } from './users.service';
import { UserRepository } from '@repositories/user.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '@modules/email/email.service';

@Module({
	imports: [
		MongooseModule.forFeatureAsync([
			{
				name: User.name,
				useFactory: UserSchemaFactory,
				inject: [],
				imports: [MongooseModule.forFeature([])],
			},
		]),
		
	
	],
	controllers: [UserController],
	providers: [
		UserService,
		JwtService,
		ConfigService,
		UserRepository,
		EmailService,
		{ provide: 'UsersRepositoryInterface', useClass: UserRepository },
	
	],
	exports: [UserService, 'UsersRepositoryInterface',UserRepository, MongooseModule],
})
export class UserModule {}
