import { BaseEntity } from '@modules/shared/base/base.entity';
import { User } from '@modules/students/entities/users.entity';
import { Schema, Prop } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SchemaFactory } from '@nestjs/mongoose';
import { NextFunction } from 'express';

export type ChatMessageDocument = HydratedDocument<ChatMessage>;

@Schema({
	timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
	toJSON: { getters: true, virtuals: true },
})
export class ChatMessage extends BaseEntity {
	constructor(data: {
		chatId: Types.ObjectId | string;
		senderId: Types.ObjectId | string;
		receiverId?: Types.ObjectId | string;
		isAI: boolean;
		content: string;
		timestamp: Date;
		isRead: boolean;
		attachments?: string[];
	}) {
		super();
		this.chatId = data.chatId;
		this.senderId = data.senderId;
		this.receiverId = data.receiverId;
		this.isAI = data.isAI;
		this.content = data.content;
		this.timestamp = data.timestamp;
		this.isRead = data.isRead;
		this.attachments = data.attachments;
	}
	@Prop({ type: Types.ObjectId, ref: 'Chat', required: true })
	chatId: Types.ObjectId | string;

	@Prop({ type: Types.ObjectId, ref: 'User', required: true })
	senderId: Types.ObjectId | string;

	@Prop({ type: Types.ObjectId, ref: 'User' })
	receiverId: Types.ObjectId | string;

	@Prop({ type: Boolean, default: false })
	isAI: boolean;

	@Prop({ type: String, required: true })
	content: string;

	@Prop({ type: Date, default: Date.now })
	timestamp: Date;

	@Prop({ type: Boolean, default: false })
	isRead: boolean;

	@Prop({ type: [String], default: [] })
	attachments: string[];
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);

export const ChatMessageSchemaFactory = () => {
	const schema = ChatMessageSchema;
	schema.pre('findOneAndDelete', async function (next: NextFunction) {
		const chatMessage = await this.model.findOne(this.getFilter());
		await Promise.all([]);
		return next();
	});
	return schema;
};

