import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, UpdateResult } from 'mongoose';
import {
	ChatMessage,
	ChatMessageDocument,
} from '@modules/chat/entities/chat-message.entity';

@Injectable()
export class ChatMessageRepository {
	constructor(
		@InjectModel(ChatMessage.name)
		private chatMessageModel: Model<ChatMessageDocument>,
	) {}

	async create(chatMessage: Partial<ChatMessage>): Promise<ChatMessage> {
		const created = new this.chatMessageModel(chatMessage);
		return created.save();
	}

	async updateMany(
		condition: FilterQuery<ChatMessage>,
		update: Partial<ChatMessage>,
	): Promise<UpdateResult> {
		return this.chatMessageModel.updateMany(condition, update).exec();
	}

	async findAll(condition: FilterQuery<ChatMessage>): Promise<ChatMessage[]> {
		return this.chatMessageModel.find(condition).exec();
	}
}
