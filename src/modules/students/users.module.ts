
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchemaFactory } from './entities/users.entity';
import { UserController } from './users.controller';
import { UserService } from './users.service';
import { UserRepository } from '@repositories/user.repository';

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
		{ provide: 'UsersRepositoryInterface', useClass: UserRepository },
	
	],
	exports: [UserService, 'UsersRepositoryInterface', MongooseModule],
})
export class UserModule {}
