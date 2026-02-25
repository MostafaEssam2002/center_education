import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class CreateCourseDto {
    @ApiProperty({ description: 'The title of the course' })
    @IsNotEmpty()
    title: string;

    @ApiProperty({ description: 'The description of the course' })
    @IsNotEmpty()
    description: string;

    @ApiProperty({ description: 'The ID of the teacher' })
    @IsNotEmpty()
    @IsNumber()
    teacherId: number;

    @ApiPropertyOptional({ description: 'Array of student IDs', type: [Number] })
    @IsOptional()
    studentIds?: number[];

    @ApiPropertyOptional({ description: 'Path to the course image' })
    @IsOptional()
    image_path?: string;

    @ApiPropertyOptional({ description: 'Alternative path to the course image' })
    @IsOptional()
    imagePath?: string;

    @ApiPropertyOptional({ description: 'Price of the course' })
    @IsOptional()
    @IsNumber()
    price?: number;

    @ApiPropertyOptional({ description: 'Discount for the course' })
    @IsOptional()
    @IsNumber()
    discount?: number;
}