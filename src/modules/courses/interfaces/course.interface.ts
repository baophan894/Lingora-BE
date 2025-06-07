import { Document } from 'mongoose';

export interface Course extends Document {
    code: string;
    name: string;
    description: string;
    language: string;
    level: string;
    durationWeeks: number;
    totalSlots: number;
    feeFull: number;
    feeInstallment: number;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    audioPracticeUrl: string;
    topics: string[];
}

export interface CourseFilters {
    search?: string;
    language?: string;
    level?: string;
    isActive?: boolean;
}