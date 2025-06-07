import {
    IsString,
    IsNotEmpty,
    IsNumber,
    IsPositive,
    IsBoolean,
    IsArray,
    IsOptional,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateCourseDto } from './create-course.dto';

export class UpdateCourseDto extends PartialType(CreateCourseDto) { }