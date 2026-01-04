import { IsInt, IsString, Min } from 'class-validator'

export class CreateQuizQuestionDto {
  @IsInt()
  quizId: number

  @IsString()
  question: string

  @IsInt()
  @Min(1)
  marks: number
}
