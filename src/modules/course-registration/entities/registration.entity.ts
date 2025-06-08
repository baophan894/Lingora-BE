import { Schema, Prop } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SchemaFactory } from '@nestjs/mongoose';
import { BaseEntity } from '@modules/shared/base/base.entity';
import { NextFunction } from 'express';

export type RegistrationDocument = HydratedDocument<Registration>;

@Schema({
	timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
	toJSON: { virtuals: true, getters: true },
})
export class Registration extends BaseEntity {
	constructor(data?: {
		studentId?: Types.ObjectId | string;
		classId?: Types.ObjectId | string;
		registrationDate?: Date;
		payment?: any;
		status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';
		paymentPlan?: 'full' | 'installment';
		installment?: any;
		invoiceNumber?: string;
	}) {
		super();
		this.studentId = data?.studentId;
		this.classId = data?.classId;
		this.registrationDate = data?.registrationDate ?? new Date();
		this.status = data?.status ?? 'PENDING';
		this.payment = data?.payment ?? null;
		this.paymentPlan = data?.paymentPlan;
		this.installment = data?.installment ?? null;
		this.invoiceNumber = data?.invoiceNumber ?? null;
	}

	@Prop({ type: Types.ObjectId, ref: 'User', required: true })
	studentId: Types.ObjectId | string;

	@Prop({ type: Types.ObjectId, ref: 'Class', required: true })
	classId: Types.ObjectId | string;

	@Prop({ default: Date.now })
	registrationDate: Date;

	@Prop({
		type: String,
		enum: ['PENDING', 'APPROVED', 'REJECTED', 'PAID'],
		default: 'PENDING',
	})
	status: string;

	@Prop({ type: String, enum: ['full', 'installment'], default: 'full' })
	paymentPlan: string;

	@Prop({ type: Object, default: null })
	payment: any;

	@Prop({ type: Object, default: null })
	installment: any;

	@Prop()
	invoiceNumber: string;
}

export const RegistrationSchema = SchemaFactory.createForClass(Registration);

export const RegistrationSchemaFactory = () => {
	const schema = RegistrationSchema;

	schema.pre('findOneAndDelete', async function (next: NextFunction) {
		const reg = await this.model.findOne(this.getFilter());
		await Promise.all([]);
		return next();
	});

	return schema;
};
