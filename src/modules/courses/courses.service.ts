import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course } from './entities/course.entity';
import { CourseFilters } from './interfaces/course.interface';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CreateCourseDto } from './dto/create-course.dto';

@Injectable()
export class CoursesService {

    constructor(
        @InjectModel(Course.name) private courseModel: Model<Course>,
    ) { }

    async findAll(filters?: CourseFilters): Promise<Course[]> {
        const query: any = {};

        if (filters) {
            if (filters.search) {
                query.$or = [
                    { name: { $regex: filters.search, $options: 'i' } },
                    { code: { $regex: filters.search, $options: 'i' } },
                ];
            }

            if (filters.language) {
                query.language = filters.language;
            }

            if (filters.level) {
                query.level = filters.level;
            }

            if (filters.isActive !== undefined) {
                query.isActive = filters.isActive;
            }
        }

        return this.courseModel.find(query).exec();
    }

    async findById(id: string): Promise<Course | null> {
        return this.courseModel.findById(id).exec();
    }

    async findActive(): Promise<Course[]> {
        return this.courseModel.find({ isActive: true }).exec();
    }

    async findActiveById(id: string): Promise<Course | null> {
        return this.courseModel.findOne({ _id: id, isActive: true }).exec();
    }


    async create(createCourseDto: CreateCourseDto): Promise<Course> {
        const createdCourse = new this.courseModel({
            ...createCourseDto,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        return createdCourse.save();
    }

    async update(id: string, updateCourseDto: UpdateCourseDto): Promise<Course> {
        const existingCourse = await this.courseModel.findByIdAndUpdate(
            id,
            { ...updateCourseDto, updatedAt: new Date() },
            { new: true },
        ).exec();

        if (!existingCourse) {
            throw new NotFoundException(`Course with ID ${id} not found`);
        }
        return existingCourse;
    }

    async delete(id: string): Promise<Course> {
        const deletedCourse = await this.courseModel.findByIdAndDelete(id).exec();
        if (!deletedCourse) {
            throw new NotFoundException(`Course with ID ${id} not found`);
        }
        return deletedCourse;
    }
}