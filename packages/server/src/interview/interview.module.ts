import { Module } from '@nestjs/common';
import { InterviewService } from './interview.service';
import { InterviewController } from './interview.controller';
import { Interview } from './interview.entity';
import { Comment } from './comment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Interview, Comment])],
  providers: [InterviewService],
  controllers: [InterviewController],
})
export class InterviewModule {}
