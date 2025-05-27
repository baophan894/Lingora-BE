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
import { JwtAccessTokenStrategy } from '@modules/auth/strategies/jwt-access-token.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtAccessTokenGuard } from '@modules/auth/guards/jwt-access-token.guard';
import { JwtStrategy } from './strategies/ws-user.strategy';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { access_token_public_key } from 'src/constraints/jwt.constraint';
@Module({
	imports: [
	  MongooseModule.forFeatureAsync([
		{ name: Chat.name, useFactory: ChatSchemaFactory, inject: [] },
		{ name: ChatMessage.name, useFactory: ChatMessageSchemaFactory, inject: [] },
		{
		  name: User.name,
		  useFactory: UserSchemaFactory,
		  inject: [],
		  imports: [MongooseModule.forFeature([])],
		},
	  ]),
	  JwtModule.register({
		publicKey: access_token_public_key, 
		verifyOptions: { algorithms: ['RS256'] }, 
	  }),
	],
	controllers: [ChatController],
	providers: [
	  ChatService,
	  ChatGateway,
	  PassportModule,
	  UserService,
	  UserRepository,
	//   JwtAccessTokenStrategy,
	  JwtStrategy,
	  WsJwtGuard,
	  JwtAccessTokenGuard,
	  { provide: 'ChatRepositoryInterface', useClass: ChatRepository },
	  { provide: 'UsersRepositoryInterface', useClass: UserRepository },
	  { provide: 'ChatMessageRepositoryInterface', useClass: ChatMessageRepository },
	],
	exports: [
	  ChatService,
	  'ChatRepositoryInterface',
	  'UsersRepositoryInterface',
	  'ChatMessageRepositoryInterface',
	  MongooseModule,
	],
  })
  export class ChatModule {}