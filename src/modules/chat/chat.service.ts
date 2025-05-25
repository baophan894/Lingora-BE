import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Chat } from './entities/chat.entity';
import { ChatMessage } from './entities/chat-message.entity';
import { CreateChatDto } from './dto/create-chat.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { User } from '../students/entities/users.entity';
import { ChatRepository } from '@repositories/chat.repository';
import { UserRepository } from '@repositories/user.repository';
import { Types } from 'mongoose';
import { ChatMessageRepository } from '@repositories/chatMessage.repository';

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
		currentUser: User,
		createChatDto: CreateChatDto,
	): Promise<Chat> {
		const participant = await this.userRepository.findById(
			createChatDto.participantId,
		);
		if (!participant) {
			throw new NotFoundException('Participant not found');
		}

		const existingChat = await this.chatRepository.findOne({
			$or: [
				{ participant1: currentUser._id, participant2: participant._id },
				{ participant1: participant._id, participant2: currentUser._id },
			],
		});

		if (existingChat) {
			return existingChat;
		}

		const newChat = new Chat({
			participant1: new Types.ObjectId(currentUser._id.toString()),
			participant2: new Types.ObjectId(participant._id.toString()),
			messages: [],
			lastMessageAt: new Date(),
		});

		return this.chatRepository.create(newChat);
	}

	async getChats(currentUser: User): Promise<Chat[]> {
		return this.chatRepository.findAll({
			$or: [{ participant1: currentUser }, { participant2: currentUser }],
		});
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
		currentUser: User,
	): Promise<ChatMessage[]> {
		const chat = await this.chatRepository.findOne({
			_id: chatId,
			$or: [
				{ participant1: currentUser._id },
				{ participant2: currentUser._id },
			],
		});

		if (!chat) {
			throw new NotFoundException('Chat not found');
		}

		return chat.messages;
	}

	async sendMessage(
		chatId: string,
		currentUser: User,
		sendMessageDto: SendMessageDto,
	): Promise<ChatMessage> {
		const chat = await this.chatRepository.findOne({
			_id: chatId,
			$or: [
				{ participant1: currentUser._id },
				{ participant2: currentUser._id },
			],
		});

		if (!chat) {
			throw new NotFoundException('Chat not found');
		}

		const receiverId = chat.participant1.toString() === currentUser._id.toString()
			? chat.participant2
			: chat.participant1;

		const message = await this.chatMessageRepository.create({
			senderId: currentUser._id.toString(),
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

	async markMessagesAsRead(chatId: string, currentUser: User): Promise<void> {
		const chat = await this.chatRepository.findOne({
			_id: chatId,
			$or: [
				{ participant1: currentUser._id },
				{ participant2: currentUser._id },
			],
		});

		if (!chat) {
			throw new NotFoundException('Chat not found');
		}

		await this.chatMessageRepository.updateMany(
			{
				chat: chatId,
				receiverId: currentUser._id,
				isRead: false,
			},
			{ isRead: true },
		);
	}
	async getUserById(userId: string): Promise<User> {
		return this.userRepository.findById(userId);
	}

	// async getUnreadCount(currentUser: User): Promise<number> {
	// 	return this.chatMessageRepository.countDocuments({
	// 		receiverId: currentUser._id,
	// 		isRead: false,
	// 	});
	// }
}
