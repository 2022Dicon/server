import { Controller, HttpException, HttpStatus } from '@nestjs/common';
import {
  Body,
  Delete,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common/decorators';
import { ApiBearerAuth, ApiBody, ApiProperty, ApiQuery } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { AccessGuard } from 'src/auth/guards/access.guard';
import { LocalGuard } from 'src/auth/guards/local.guard';
import { User } from 'src/profile/user.entity';
import { Between, Like, Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { Interview, InterviewCategory } from './interview.entity';
import { InterviewService } from './interview.service';

export class InterviewPayload {
  @ApiProperty({
    name: 'title',
    description: 'Interview title',
  })
  title!: string;

  @ApiProperty({
    name: 'thumbnail',
    description: 'Interview thumbnail',
  })
  thumbnail!: string;

  @ApiProperty({
    name: 'amount',
    description: 'Interview amount',
  })
  amount!: number;

  @ApiProperty({
    name: 'category',
    description: 'Interview category',
  })
  category!: InterviewCategory;

  @ApiProperty({
    name: 'field',
    description: 'Interview field',
  })
  field!: number;

  @ApiProperty({
    name: 'description',
    description: 'Interview description',
  })
  description!: string;
}

export class CommentPayload {
  @ApiProperty({
    name: 'score',
    description: 'Comment score',
  })
  score!: number;

  @ApiProperty({
    name: 'content',
    description: 'Comment content',
  })
  content!: string;
}

@Controller('interview')
export class InterviewController {
  constructor(
    private readonly service: InterviewService,
    @InjectRepository(Interview)
    private readonly interview: Repository<Interview>,
    @InjectRepository(Comment)
    private readonly comment: Repository<Comment>,
    @InjectRepository(User)
    private readonly user: Repository<User>,
  ) {}

  @Get('/')
  @ApiBearerAuth()
  @UseGuards(AccessGuard)
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiQuery({ name: 'amountFrom', required: false, type: Number })
  @ApiQuery({ name: 'amountTo', required: false, type: Number })
  @ApiQuery({ name: 'title', required: false, type: String })
  async getInterviews(
    @Query('page') page = 1,
    @Query('limit') limit = 25,
    @Query('category') category?: string,
    @Query('type') type?: number,
    @Query('amountFrom') amountFrom?: number,
    @Query('amountTo') amountTo?: number,
    @Query('title') title?: string,
  ): Promise<Interview[]> {
    const interviews = await this.interview.find({
      loadEagerRelations: false,
      where: {
        category,
        field: type,
        amount:
          amountFrom && amountTo ? Between(amountFrom, amountTo) : undefined,
        title: title ? Like(`%${title}%`) : undefined,
      },
      skip: (page - 1) * limit,
      take: limit,
    });
    return interviews ?? [];
  }

  @Get('/:id')
  @ApiBearerAuth()
  @UseGuards(AccessGuard)
  async getInterview(@Query('id') id: string): Promise<Interview> {
    const interview = await this.interview.findOneBy({ id });
    if (!interview) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
    return interview;
  }

  @Post('/')
  @ApiBearerAuth()
  @ApiBody({ type: InterviewPayload })
  @UseGuards(AccessGuard)
  async createInterview(
    @Body() payload: InterviewPayload,
    @Req() req: Request,
  ): Promise<Interview> {
    const interview = this.interview.create({ ...payload, user: req.user });
    await this.interview.save(interview);
    return interview;
  }

  @Delete('/:id')
  @ApiBearerAuth()
  @UseGuards(AccessGuard)
  async deleteInterview(
    @Query('id') id: string,
    @Req() req: Request,
  ): Promise<boolean> {
    const interview = await this.interview.findOneBy({ id });
    if (!interview) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
    if (interview.user.id !== req.user?.id) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
    await this.interview.delete(interview);
    return true;
  }

  @Post('/:id/comment')
  @ApiBearerAuth()
  @ApiBody({ type: CommentPayload })
  @UseGuards(AccessGuard)
  async postComment(
    @Query('id') id: string,
    @Body('score') score: number,
    @Body('content') content: string,
    @Req() req: Request,
  ): Promise<string> {
    const interview = await this.interview.findOneBy({ id });
    if (!interview) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }

    const comment = this.comment.create({
      score,
      content,
      interview,
      user: req.user,
    });
    await this.comment.save(comment);

    return comment.id;
  }

  @Delete('/:id/comment/:commentId')
  @ApiBearerAuth()
  @UseGuards(AccessGuard)
  async deleteComment(
    @Query('id') id: string,
    @Query('commentId') commentId: string,
    @Req() req: Request,
  ): Promise<boolean> {
    console.log(req.user);

    const comment = await this.comment.findOne({
      where: { id: commentId },
      relations: ['interview', 'user'],
    });
    const interview = comment?.interview;

    if (!comment || !interview) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
    console.log(comment);

    if (comment.user.id !== req.user?.id) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    await this.comment.delete(comment);

    return true;
  }
}
