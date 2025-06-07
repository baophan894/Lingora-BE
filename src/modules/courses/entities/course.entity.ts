import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Course extends Document {
    @Prop({ required: true, unique: true })
    code: string;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    description: string;

    @Prop({ required: true })
    language: string;

    @Prop({ required: true })
    level: string;

    @Prop({ required: true, min: 1 })
    durationWeeks: number;

    @Prop({ required: true, min: 1 })
    totalSlots: number;

    @Prop({ required: true, min: 0 })
    feeFull: number;

    @Prop({ required: true, min: 0 })
    feeInstallment: number;

    @Prop({ required: true })
    createdBy: string;

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ default: '' })
    audioPracticeUrl: string;

    @Prop({ type: [String], default: [] })
    topics: string[];
}

export const CourseSchema = SchemaFactory.createForClass(Course);