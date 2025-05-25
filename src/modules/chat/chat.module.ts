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
import { UserSchemaFactory } from '@modules/students/entities/users.entity';
import { User } from '@modules/students/entities/users.entity';

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
		JwtModule.register({
			secret: process.env.JWT_SECRET,
			signOptions: { expiresIn: '1d' },
		}),
	],
	controllers: [ChatController],
	providers: [
		ChatService,
		ChatGateway,
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
