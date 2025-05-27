import { Schema, Prop } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId, Types } from 'mongoose';
import { SchemaFactory } from '@nestjs/mongoose';
import { BaseEntity } from '@modules/shared/base/base.entity';
import { NextFunction } from 'express';

export type ChatDocument = HydratedDocument<Chat>;

@Schema({
	timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
	toJSON: { getters: true, virtuals: true },
})
export class Chat extends BaseEntity {
	constructor(data?: {
		participant1?: Types.ObjectId | string;
		participant2?: Types.ObjectId | string;
		messages?: ObjectId[];
		lastMessageAt?: Date;
	}) {
		super();
		this.participant1 = data.participant1;
		this.participant2 = data.participant2;
		this.messages = data.messages || [];
		this.lastMessageAt = data.lastMessageAt || new Date();
	}

	@Prop({ type: Types.ObjectId, ref: 'User', required: true })
	participant1: Types.ObjectId | string;

	@Prop({ type: Types.ObjectId, ref: 'User', required: true })
	participant2: Types.ObjectId | string;

	@Prop({
		type: [{ type: Types.ObjectId, ref: 'ChatMessage' }],
		default: [],
	})
	messages: ObjectId[];

	@Prop({ type: Date, default: Date.now })
	lastMessageAt: Date;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);

export const ChatSchemaFactory = () => {
	const schema = ChatSchema;
	schema.pre('findOneAndDelete', async function (next: NextFunction) {
		const chat = await this.model.findOne(this.getFilter());
		await Promise.all([]);
		return next();
	});
	return schema;
};
