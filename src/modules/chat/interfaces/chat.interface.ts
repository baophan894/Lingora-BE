import { Chat } from '../entities/chat.entity';
import { FilterQuery } from 'mongoose';
export interface ChatRepositoryInterface {
	create(chat: Chat): Promise<Chat>;
	findAll(): Promise<Chat[]>;
    findOne(condition: FilterQuery<Chat>): Promise<Chat | null>;
	findById(id: string): Promise<Chat | null>;
	update(id: string, chat: Chat): Promise<Chat | null>;
	delete(id: string): Promise<Chat | null>;
}

