import {
	WebSocketGateway,
	WebSocketServer,
	SubscribeMessage,
	OnGatewayConnection,
	OnGatewayDisconnect,
	MessageBody,
	ConnectedSocket,
	WsException,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { User } from '@modules/users/entities/users.entity';
import { JwtAccessTokenGuard } from '@modules/auth/guards/jwt-access-token.guard';
import { access_token_public_key } from 'src/constraints/jwt.constraint';
import { JwtService } from '@nestjs/jwt';

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

	constructor(private readonly chatService: ChatService,
		private readonly jwtService: JwtService,) {}

	async handleConnection(@ConnectedSocket() client: Socket) {
		const token = client.handshake?.auth?.token;
		if (!token) {
		  console.warn('❌ No token provided');
		  client.disconnect();
		  return;
		}
		try {
		  const payload = await this.jwtService.verifyAsync(token, {
			secret: access_token_public_key, 
		  });
		  console.log("Payload: ",payload);
		  const user = await this.chatService.getUserById(payload.userId);
		  if (!user) {
			console.warn('❌ Invalid user from token');
			client.disconnect();
			return;
		  }
		  client.data.user = user;
		  console.log("client.data.user: ", client.data.user);
		  this.userSockets.set(user.id, client);
		  client.join(`user_${user.id}`);
		  console.log(`✅ Connected: ${user.id}`);
		} catch (err) {
		  console.error('❌ Token verify failed:', err.message);
		  client.disconnect();
		}
	}
	async handleDisconnect(client: Socket) {
		for (const [userId, socket] of this.userSockets.entries()) {
			if (socket === client) {
				this.userSockets.delete(userId);
				console.log(`🚪 Disconnected: ${userId}`);
				break;
			}
		}
	}

	// @UseGuards(WsJwtGuard)
	@SubscribeMessage('sendMessage')
	async handleMessage(
  		@ConnectedSocket() client: Socket,
  		@MessageBody() payload: { chatId: string; message: SendMessageDto },
		) {
  		console.log('📩 Received message:', payload);
  		console.log('Client data:', client.data); 

  		const user = client.data.user;
  		if (!user) {
    	console.error('❌ User not found in client data');
    	throw new WsException('Unauthorized');
  		}

  		try {
    		console.log('Sending message with chatId:', payload.chatId);
    		const message = await this.chatService.sendMessage(payload.chatId, user, payload.message);
    		console.log('Message sent:', message);

    		const chat = await this.chatService.getChatById(payload.chatId.toString());
    		console.log('Chat found:', chat);
			if (!chat || !chat.participant1 || !chat.participant2) {
  			console.error('❌ Chat or participants not found');
  			client.emit('error', { message: 'Chat or participants not found' });
  			return;
			}
    		const receiverId = chat.participant1.toString() === user._id.toString() ? chat.participant2 : chat.participant1;

    		this.server.to(`user_${receiverId}`).emit('newMessage', message);
    		this.server.to(`user_${user._id}`).emit('messageSent', message);
    		console.log(`Emitted to user_${receiverId} and user_${user._id}`);
  		} catch (error) {
   			 console.error('❌ Send message error:', error);
    		client.emit('error', { message: error.message || 'Failed to send message' });
  		}
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('markAsRead')
	async handleMarkAsRead(
		@ConnectedSocket() client: Socket,
		@MessageBody() chatId: string,
	) {
		const user = client.data.user as User;
		if (!user) throw new WsException('Unauthorized');

		try {
			await this.chatService.markMessagesAsRead(chatId, user);

			client.emit('messagesRead', { chatId });
		} catch (error) {
			console.error('❌ Mark as read error:', error);
			client.emit('error', {
				message: error.message || 'Failed to mark messages as read',
			});
		}
	}
}
