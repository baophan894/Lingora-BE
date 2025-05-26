import { Chat, ChatDocument } from '@modules/chat/entities/chat.entity';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';


@Injectable()
export class ChatRepository {
	constructor(
		@InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
	) {}

	async create(chat: Partial<Chat>): Promise<Chat> {
		const created = new this.chatModel(chat);
		return created.save();
	}

	// async findAll(condition: FilterQuery<Chat>): Promise<Chat[]> {
	// 	return this.chatModel.find(condition).exec();
	// }

	async findAll(filter : FilterQuery<Chat>, populateFields : string[] = []) {
		let query = this.chatModel.find(filter);
		populateFields.forEach(field => {
			query = query.populate(field);
		});
		return query.exec();
	}

	async findOne(condition: FilterQuery<Chat>): Promise<Chat | null> {
		return this.chatModel.findOne(condition).exec();
	}

	async findById(id: string): Promise<Chat | null> {
		return this.chatModel.findById(id).exec();
	}

	async update(id: string, chat: Partial<Chat>): Promise<Chat | null> {
		return this.chatModel.findByIdAndUpdate(id, chat, { new: true }).exec();
	}

	async delete(id: string): Promise<Chat | null> {
		return this.chatModel.findByIdAndDelete(id).exec();
	}
}

