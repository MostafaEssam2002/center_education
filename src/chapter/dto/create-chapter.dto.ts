import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class CreateChapterDto {
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    content?: string;

    @IsInt()
    @Min(1)
    courseId: number;

    @IsOptional() // دلوقتي متوافق مع Prisma
    @IsString()
    videoPath?: string; // اختياري

    @IsOptional()
    @IsString()
    pdfPath?: string;   // اختياري

    // @IsOptional()
    @IsInt()
    order: number; // ترتيب الفصل في الكورس
}
