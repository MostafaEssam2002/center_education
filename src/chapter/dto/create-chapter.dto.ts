import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class CreateChapterDto {
    @ApiProperty({ description: 'The title of the chapter' })
    @IsString()
    title: string;

    @ApiPropertyOptional({ description: 'The content/description of the chapter' })
    @IsOptional()
    @IsString()
    content?: string;

    @ApiProperty({ description: 'The ID of the course this chapter belongs to' })
    @IsInt()
    @Min(1)
    courseId: number;

    @ApiPropertyOptional({ description: 'Path to the chapter video file' })
    @IsOptional()
    @IsString()
    videoPath?: string;

    @ApiPropertyOptional({ description: 'Path to the chapter PDF file' })
    @IsOptional()
    @IsString()
    pdfPath?: string;

    @ApiProperty({ description: 'The order of the chapter within the course' })
    @IsInt()
    order: number;
}
