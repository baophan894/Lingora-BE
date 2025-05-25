import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	UseGuards,
	Request,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { WsJwtGuard } from './guards/ws-jwt.guard';

@Controller('chats')
@UseGuards(WsJwtGuard)
export class ChatController {
	constructor(private readonly chatService: ChatService) {}

	@Post()
	createChat(@Request() req, @Body() createChatDto: CreateChatDto) {
		return this.chatService.createChat(req.user, createChatDto);
	}

	@Get()
	getChats(@Request() req) {
		return this.chatService.getChats(req.user);
	}

	@Get(':chatId/messages')
	getChatMessages(@Request() req, @Param('chatId') chatId: string) {
		return this.chatService.getChatMessages(chatId, req.user);
	}

	@Post(':chatId/messages')
	sendMessage(
		@Request() req,
		@Param('chatId') chatId: string,
		@Body() sendMessageDto: SendMessageDto,
	) {
		return this.chatService.sendMessage(chatId, req.user, sendMessageDto);
	}

	@Post(':chatId/read')
	markMessagesAsRead(@Request() req, @Param('chatId') chatId: string) {
		return this.chatService.markMessagesAsRead(chatId, req.user);
	}
}
