import {
	WebSocketGateway,
	WebSocketServer,
	SubscribeMessage,
	OnGatewayConnection,
	OnGatewayDisconnect,
	WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { JwtService } from '@nestjs/jwt';
import { User } from '@modules/users/entities/users.entity';

@WebSocketGateway({
	cors: {
		origin: '*',
	},
	namespace: 'chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	server: Server;

	private userSockets: Map<string, Socket> = new Map();

	constructor(
		private readonly chatService: ChatService,
		private readonly jwtService: JwtService,
	) {}

	async handleConnection(client: Socket) {
		try {
			const user = await this.validateUser(client);
			if (user) {
				this.userSockets.set(user.id, client);
				client.join(`user_${user.id}`);

				// Send unread count on connection
				// const unreadCount = await this.chatService.getUnreadCount(user as User);
				// client.emit('unreadCount', unreadCount);
			}
		} catch (error) {
			client.disconnect();
		}
	}

	handleDisconnect(client: Socket) {
		for (const [userId, socket] of this.userSockets.entries()) {
			if (socket === client) {
				this.userSockets.delete(userId);
				break;
			}
		}
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('sendMessage')
	async handleMessage(
		client: Socket,
		payload: { chatId: string; message: SendMessageDto },
	) {
		try {
			const user = await this.validateUser(client);
			if (!user) throw new WsException('Unauthorized');

			const message = await this.chatService.sendMessage(
				payload.chatId,
				user as User,
				payload.message,
			);

			const chat = await this.chatService.getChatById(payload.chatId);
			const receiverId =
				chat.participant1.toString() === user.id
					? chat.participant2
					: chat.participant1;

			// Emit to receiver
			this.server.to(`user_${receiverId}`).emit('newMessage', message);

			// Emit to sender
			client.emit('messageSent', message);

			// Update unread count for receiver
			const receiver = await this.chatService.getUserById(
				receiverId.toString(),
			);
			// if (receiver) {
			// 	const unreadCount = await this.chatService.getUnreadCount(receiver);
			// 	this.server.to(`user_${receiverId}`).emit('unreadCount', unreadCount);
			// }
		} catch (error) {
			client.emit('error', {
				message: error.message || 'Failed to send message',
			});
		}
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('markAsRead')
	async handleMarkAsRead(client: Socket, chatId: string) {
		try {
			const user = await this.validateUser(client);
			if (!user) throw new WsException('Unauthorized');

			await this.chatService.markMessagesAsRead(chatId, user as User);

			// Update unread count
			// const unreadCount = await this.chatService.getUnreadCount(user as User);
			// client.emit('unreadCount', unreadCount);

			client.emit('messagesRead', { chatId });
		} catch (error) {
			client.emit('error', {
				message: error.message || 'Failed to mark messages as read',
			});
		}
	}

	private async validateUser(client: Socket) {
		try {
			const token = client.handshake.auth.token;
			if (!token) return null;

			const payload = await this.jwtService.verifyAsync(token);
			return payload;
		} catch (error) {
			return null;
		}
	}
}
