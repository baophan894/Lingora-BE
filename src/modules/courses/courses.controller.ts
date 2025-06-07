import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    ParseBoolPipe,
    DefaultValuePipe,
    NotFoundException,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseFilters } from './interfaces/course.interface';

@Controller('courses')
export class CoursesController {
    constructor(private readonly coursesService: CoursesService) { }

    @Get()
    findAll() {
        return this.coursesService.findAll();
    }


    @Get('active')
    findActive() {
        return this.coursesService.findActive();
    }

    @Get('active/:id')
    async findActiveById(@Param('id') id: string) {
        const course = await this.coursesService.findActiveById(id);
        if (!course) {
            throw new NotFoundException(`Active course with ID ${id} not found`);
        }
        return course;
    }

    @Get(':id')
    async findById(@Param('id') id: string) {
        const course = await this.coursesService.findById(id);
        if (!course) {
            throw new NotFoundException(`Course with ID ${id} not found`);
        }
        return course;
    }


    @Post()
    create(@Body() createCourseDto: CreateCourseDto) {
        return this.coursesService.create(createCourseDto);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
        return this.coursesService.update(id, updateCourseDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.coursesService.delete(id);
    }
}