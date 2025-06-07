import {
    IsString,
    IsNotEmpty,
    IsNumber,
    IsPositive,
    IsBoolean,
    IsArray,
    IsOptional,
} from 'class-validator';

export class CreateCourseDto {
    @IsString()
    @IsNotEmpty()
    code: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsString()
    @IsNotEmpty()
    language: string;

    @IsString()
    @IsNotEmpty()
    level: string;

    @IsNumber()
    @IsPositive()
    durationWeeks: number;

    @IsNumber()
    @IsPositive()
    totalSlots: number;

    @IsNumber()
    @IsPositive()
    feeFull: number;

    @IsNumber()
    @IsPositive()
    feeInstallment: number;

    @IsString()
    @IsNotEmpty()
    createdBy: string;

    @IsBoolean()
    @IsOptional()
    isActive: boolean;

    @IsString()
    @IsOptional()
    audioPracticeUrl: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    topics: string[];
}