import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Chat, ChatSchema, ChatSchemaFactory } from './entities/chat.entity';
import { ChatMessage, ChatMessageSchema, ChatMessageSchemaFactory } from './entities/chat-message.entity';
import { ChatGateway } from './chat.gateway';
import { JwtModule } from '@nestjs/jwt';
import { ChatRepository } from '@repositories/chat.repository';
import { UserRepository } from '@repositories/user.repository';
import { ChatMessageRepository } from '@repositories/chatMessage.repository';
import { User } from '@modules/users/entities/users.entity';
import { UserSchemaFactory } from '@modules/users/entities/users.entity';
import { UserService } from '@modules/users/users.service';
@Module({
	imports: [
		MongooseModule.forFeatureAsync([
			{
				name: Chat.name,
				useFactory: ChatSchemaFactory,
				inject: [],
			},
			{
				name: ChatMessage.name,
				useFactory: ChatMessageSchemaFactory,
				inject: [],
			},
			{
				name: User.name,		
				useFactory: UserSchemaFactory,
				inject: [],
				imports: [MongooseModule.forFeature([])],
			},
		]),
		JwtModule.register({}),
	],
	controllers: [ChatController],
	providers: [
		ChatService,
		ChatGateway,
		UserService,
		{ provide: 'ChatRepositoryInterface', useClass: ChatRepository },
		{ provide: 'UsersRepositoryInterface', useClass: UserRepository },
		{
			provide: 'ChatMessageRepositoryInterface',
			useClass: ChatMessageRepository,
		},
	],
	exports: [ChatService, 'ChatRepositoryInterface', 'UsersRepositoryInterface', 'ChatMessageRepositoryInterface', MongooseModule],
})
export class ChatModule {}
