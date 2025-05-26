import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Chat } from './entities/chat.entity';
import { ChatMessage } from './entities/chat-message.entity';
import { CreateChatDto } from './dto/create-chat.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { ChatRepository } from '@repositories/chat.repository';
import { UserRepository } from '@repositories/user.repository';
import { Types } from 'mongoose';
import { ChatMessageRepository } from '@repositories/chatMessage.repository';
import { User } from '@modules/users/entities/users.entity';

@Injectable()
export class ChatService {
	constructor(
		@Inject('ChatRepositoryInterface')
		private readonly chatRepository: ChatRepository,
		@Inject('UsersRepositoryInterface')
		private readonly userRepository: UserRepository,
		@Inject('ChatMessageRepositoryInterface')
		private readonly chatMessageRepository: ChatMessageRepository,
	) {}

	async createChat(
		currentUser: any,
		createChatDto: CreateChatDto,
	): Promise<Chat> {
		const participant = await this.userRepository.findById(
			createChatDto.participantId.toString(),
		);
		console.log('participant', participant);
		console.log('currentUser', currentUser);
		if (!participant) {
			throw new NotFoundException('Không tìm thấy participant');
		}

		const existingChat = await this.chatRepository.findOne({
			$or: [
				{ participant1: currentUser.userId, participant2: participant._id },
				{ participant1: participant._id, participant2: currentUser.userId },
			],
		});

		if (existingChat) {
			return existingChat;
		}

		const newChat = new Chat({
			participant1: new Types.ObjectId(currentUser.userId.toString()),
			participant2: new Types.ObjectId(participant._id.toString()),
			messages: [],
			lastMessageAt: new Date(),
		});

		return this.chatRepository.create(newChat);
	}

	async getChats(currentUser: any): Promise<Chat[]> {
		const userObjectId = new Types.ObjectId(currentUser.userId);
		return this.chatRepository.findAll(
			{
				$or: [{ participant1: userObjectId }, { participant2: userObjectId }],
			},
			['participant1', 'participant2'],
		);
	}

	async getChatById(chatId: string): Promise<Chat> {
		const chat = await this.chatRepository.findById(chatId);
		if (!chat) {
			throw new NotFoundException('Chat not found');
		}
		return chat;
	}

	async getChatMessages(
		chatId: string,
		currentUser: any,
	): Promise<ChatMessage[]> {
		const chatIdObjectId = new Types.ObjectId(chatId);
		const currentUserObjectId = new Types.ObjectId(currentUser.userId);
		const chat = await this.chatRepository.findOne({
			_id: chatIdObjectId,
			$or: [
				{ participant1: currentUserObjectId },
				{ participant2: currentUserObjectId },
			],
		});

		if (!chat) {
			throw new NotFoundException('Chat not found');
		}

		return chat.messages;
	}

	async sendMessage(
		chatId: string,
		currentUser: any,
		sendMessageDto: SendMessageDto,
	): Promise<ChatMessage> {
		const chat = await this.chatRepository.findOne({
			_id: chatId,
			$or: [
				{ participant1: currentUser.userId },
				{ participant2: currentUser.userId },
			],
		});

		if (!chat) {
			throw new NotFoundException('Chat not found');
		}

		const receiverId =
			chat.participant1.toString() === currentUser.userId.toString()
				? chat.participant2
				: chat.participant1;

		const message = await this.chatMessageRepository.create({
			senderId: currentUser.userId.toString(),
			receiverId: receiverId.toString(),
			content: sendMessageDto.content,
			chatId: chatId,
		});

		chat.messages.push(message);

		await this.chatRepository.update(chatId, {
			messages: chat.messages,
			lastMessageAt: new Date(),
		});

		return message;
	}

	async markMessagesAsRead(chatId: string, currentUser: any): Promise<void> {
		const chat = await this.chatRepository.findOne({
			_id: chatId,
			$or: [
				{ participant1: currentUser.userId },
				{ participant2: currentUser.userId },
			],
		});

		if (!chat) {
			throw new NotFoundException('Chat not found');
		}

		await this.chatMessageRepository.updateMany(
			{
				chat: chatId,
				receiverId: currentUser.userId,
				isRead: false,
			},
			{ isRead: true },
		);
	}
	async getUserById(userId: string): Promise<User> {
		return this.userRepository.findById(userId);
	}

	// async getUnreadCount(currentUser: any): Promise<number> {
	// 	return this.chatMessageRepository.countDocuments({
	// 		receiverId: currentUser.userId,
	// 		isRead: false,
	// 	});
	// }
}
