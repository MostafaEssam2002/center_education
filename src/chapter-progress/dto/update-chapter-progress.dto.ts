import { PartialType } from '@nestjs/swagger';
import { CreateChapterProgressDto } from './create-chapter-progress.dto';

export class UpdateChapterProgressDto extends PartialType(CreateChapterProgressDto) {}
