import { IsNotEmpty, IsNumber, IsOptional } from "class-validator";
export class CreateCourseDto {
    @IsNotEmpty()
    title: string;
    @IsNotEmpty()
    description: string;
    @IsNotEmpty()
    @IsNumber()
    teacherId: number;
    @IsOptional()
    studentIds?: number[];
    @IsOptional()
    image_path?: string;
    @IsOptional()
    imagePath?: string;
    @IsOptional()
    @IsNumber()
    price?: number;
    @IsOptional()
    @IsNumber()
    discount?: number;
}