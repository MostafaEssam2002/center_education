import { PartialType } from '@nestjs/swagger';
import { CreateCourseDto } from './create-course.dto';

export class UpdateCourseDto extends PartialType(CreateCourseDto) {
    title?: string;
    description?: string;
    teacherId?: number;
    studentIds?: number[];
    imagePath?: string;
    image_path?: string;
}