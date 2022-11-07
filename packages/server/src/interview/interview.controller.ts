import { Controller, HttpException, HttpStatus } from '@nestjs/common';
import {
  Body,
  Delete,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common/decorators';
import { ApiQuery } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { AccessGuard } from 'src/auth/guards/access.guard';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { Interview } from './interview.entity';
import { InterviewService } from './interview.service';

@Controller('interview')
export class InterviewController {
  constructor(
    private readonly service: InterviewService,
    @InjectRepository(Interview)
    private readonly interview: Repository<Interview>,
    @InjectRepository(Comment)
    private readonly comment: Repository<Comment>,
  ) {}

  @Get('/')
  @UseGuards(AccessGuard)
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiQuery({ name: 'amount', required: false, type: Number })
  @ApiQuery({ name: 'title', required: false, type: String })
  getInterviews(
    @Query('page') page = 1,
    @Query('limit') limit = 25,
    @Query('category') category?: string,
    @Query('type') type?: string,
    @Query('amount') amount?: number,
    @Query('title') title?: string,
  ): string {
    return `Interviews: page=${page}, limit=${limit}, category=${category}, type=${type}, amount=${amount}, title=${title}`;
  }

  @Get('/:id')
  @UseGuards(AccessGuard)
  async getInterview(@Query('id') id: string): Promise<Interview> {
    const interview = await this.interview.findOneBy({ id });
    if (!interview) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
    return interview;
  }

  @Post('/:id/comment')
  @UseGuards(AccessGuard)
  async postComment(
    @Query('id') id: string,
    @Body('score') score: number,
    @Body('content') content: string,
  ): Promise<string> {
    const interview = await this.interview.findOneBy({ id });
    if (!interview) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }

    const comment = await this.comment.create({
      interview: interview,
    });

    interview.comments.push(comment);

    this.interview.update(interview.id, interview);

    return 'OK';
  }

  @Delete('/:id/comment/:commentId')
  @UseGuards(AccessGuard)
  deleteComment(
    @Query('id') id: string,
    @Query('commentId') commentId: string,
  ): string {
    return `Comment: id=${id}, commentId=${commentId}`;
  }
}
