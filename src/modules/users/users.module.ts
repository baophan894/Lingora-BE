
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchemaFactory } from './entities/users.entity';
import { UserService } from './users.service';
import { UserRepository } from '@repositories/user.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '@modules/email/email.service';
import { AwsS3Service } from "../../services/aws-s3.service";
import { GeneratorService } from '../../services/generator.service';
import { UserController } from './users.controller';

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
		AwsS3Service,
		GeneratorService,

		{ provide: 'UsersRepositoryInterface', useClass: UserRepository },
	
	],
	exports: [UserService, 'UsersRepositoryInterface',UserRepository, MongooseModule, AwsS3Service],
})
export class UserModule {}
