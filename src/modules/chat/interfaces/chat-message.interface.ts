import { ChatMessage } from '../entities/chat-message.entity';
import { FilterQuery, UpdateResult } from 'mongoose';
export interface ChatMessageRepositoryInterface {
	create(chatMessage: ChatMessage): Promise<ChatMessage>;
	findAll(): Promise<ChatMessage[]>;
	updateMany(condition: FilterQuery<ChatMessage>, update: Partial<ChatMessage>): Promise<UpdateResult>;
}

