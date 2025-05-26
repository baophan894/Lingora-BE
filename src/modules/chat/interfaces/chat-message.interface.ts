import { ChatMessage } from '../entities/chat-message.entity';

export interface ChatMessageRepositoryInterface {
	create(chatMessage: ChatMessage): Promise<ChatMessage>;
	findAll(): Promise<ChatMessage[]>;
}

