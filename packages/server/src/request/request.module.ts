import { Module } from '@nestjs/common';
import { RequestService } from './request.service';
import { RequestController } from './request.controller';
import { User } from 'src/profile/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import Request from './request.entity';
import Question from './question.entity';
import { Interview } from 'src/interview/interview.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Interview, Request, Question])],
  providers: [RequestService],
  controllers: [RequestController],
})
export class RequestModule {}
