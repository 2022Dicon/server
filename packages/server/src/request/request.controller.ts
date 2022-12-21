import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  Delete,
  Get,
  Post,
  Put,
} from '@nestjs/common/decorators/http/request-mapping.decorator';
import { ApiBearerAuth, ApiBody, ApiProperty } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Request as ExpressRequest } from 'express';
import { DateTime } from 'luxon';
import { AccessGuard } from 'src/auth/guards/access.guard';
import { Interview, InterviewCategory } from 'src/interview/interview.entity';
import { User } from 'src/profile/user.entity';
import { Repository, UpdateResult } from 'typeorm';
import Question from './question.entity';
import Record from './record.entity';
import Request, { RequestStatus } from './request.entity';
import { RequestService, ValidationRole } from './request.service';

export class RequestPayload {
  @ApiProperty({
    name: 'title',
    description: 'Request title',
  })
  title!: string;

  @ApiProperty({
    name: 'thumbnail',
    description: 'Request thumbnail',
  })
  thumbnail!: string;

  @ApiProperty({
    name: 'category',
    description: 'Request category',
  })
  category!: InterviewCategory;

  @ApiProperty({
    name: 'date',
    description: 'Interview date',
  })
  date!: string;

  @ApiProperty({
    name: 'location',
    description: 'Interview location',
  })
  location!: string;
}

export class QuestionPayload {
  @ApiProperty({
    name: 'content',
    description: 'Question',
  })
  content!: string;
}

@Controller('request')
export class RequestController {
  constructor(
    @InjectRepository(Interview)
    private readonly interview: Repository<Interview>,
    @InjectRepository(Request)
    private readonly request: Repository<Request>,
    @InjectRepository(Question)
    private readonly question: Repository<Question>,
    @InjectRepository(User)
    private readonly user: Repository<User>,
    @InjectRepository(Record)
    private readonly record: Repository<Record>,
    private readonly service: RequestService,
  ) {}

  @Get(['/', '/me'])
  @ApiBearerAuth()
  @UseGuards(AccessGuard)
  async getMyRequests(@Req() req: ExpressRequest): Promise<Request[]> {
    const interview = await this.interview.findOne({
      where: { user: req.user },
      relations: ['requests'],
    });
    const requests = interview?.requests ?? [];

    return requests;
  }

  @Get('/:int_id')
  @ApiBearerAuth()
  @UseGuards(AccessGuard)
  async getRequests(@Param('int_id') id: string): Promise<Request[]> {
    const interview = await this.interview.findOne({
      where: { id },
      relations: ['requests'],
    });
    const requests = interview?.requests;

    if (!requests) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }

    return requests;
  }

  @Get('/:int_id/:id')
  @ApiBearerAuth()
  @UseGuards(AccessGuard)
  async getRequest(
    @Param('int_id') int_id: string,
    @Param('id') id: string,
  ): Promise<Request> {
    const request = await this.request.findOne({
      where: { id, interview: { id: int_id } },
    });

    if (!request) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }

    return request;
  }

  @Post('/:int_id')
  @ApiBearerAuth()
  @ApiBody({ type: RequestPayload })
  @UseGuards(AccessGuard)
  async createRequest(
    @Param('int_id') int_id: string,
    @Body() payload: RequestPayload,
    @Req() req: ExpressRequest,
  ): Promise<Request> {
    const date = DateTime.fromFormat(payload.date, 'MM/dd hh:mm', {
      zone: 'utc',
    }).toJSDate();

    const request = this.request.create({
      title: payload.title,
      thumbnail: payload.thumbnail,
      category: payload.category,
      date,
      location: payload.location,
      interview: { id: int_id },
      user: req.user,
    });

    await this.request.save(request);

    return request;
  }

  @Delete('/:int_id/:id')
  @ApiBearerAuth()
  @ApiBody({ type: RequestPayload })
  @UseGuards(AccessGuard)
  async deleteRequest(
    @Param('int_id') int_id: string,
    @Param('id') id: string,
    @Req() req: ExpressRequest,
  ): Promise<boolean> {
    const interview = await this.interview.findOneBy({ id: int_id });
    const request = await this.request.findOneBy({
      id,
      interview: { id: int_id },
    });

    if (!request) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }

    if (
      request.user.id !== req.user?.id &&
      interview?.user.id !== req.user?.id
    ) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    await this.request.remove(request);

    return true;
  }

  @Put('/:int_id/:id')
  @ApiBearerAuth()
  @ApiBody({ type: RequestPayload })
  @UseGuards(AccessGuard)
  async updateRequest(
    @Param('int_id') int_id: string,
    @Param('id') id: string,
    @Body() payload: RequestPayload,
    @Req() req: ExpressRequest,
  ) {
    let request = await this.request.findOne({
      where: { id, interview: { id: int_id } },
      relations: ['interview', 'interview.user'],
    });

    if (!request) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }

    if (request.user.id === req.user?.id) {
      request = this.request.merge(request, {
        title: payload.title,
        thumbnail: payload.thumbnail,
        category: payload.category,
        date: payload.date,
        location: payload.location,
      });
    } else if (request.interview.user.id === req.user?.id) {
      request = this.request.merge(request, {
        date: payload.date,
        location: payload.location,
      });
    } else {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    await this.request.save(request);
  }

  @Put('/:int_id/:id')
  @ApiBearerAuth()
  @ApiBody({ type: RequestPayload })
  @UseGuards(AccessGuard)
  async uploadRecord(
    @Param('int_id') int_id: string,
    @Param('id') id: string,
    @Body() payload: RequestPayload,
    @Req() req: ExpressRequest,
  ) {
    const request = await this.request.findOne({
      where: { id, interview: { id: int_id } },
      relations: ['interview', 'interview.user'],
    });

    if (!request) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }

    if (
      !(await this.service.validateUserPermissionWithRequest(
        req,
        ValidationRole.RequestOrInterview,
        request,
      ))
    ) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    // ToDo: upload record
    const record = await this.record.save(this.record.create({}));
    request.records.push(record);

    await this.request.save(request);
  }

  //#region Question

  @Get('/:int_id/:id/question')
  @ApiBearerAuth()
  @UseGuards(AccessGuard)
  async getRequestQuestions(
    @Param('int_id') int_id: string,
    @Param('id') id: string,
  ): Promise<Question[]> {
    const request = await this.request.findOneBy({
      id,
      interview: { id: int_id },
    });
    const questions = request?.questions;

    if (!request || !questions) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }

    return questions;
  }

  @Post('/:int_id/:id/question')
  @ApiBearerAuth()
  @UseGuards(AccessGuard)
  async createRequestQuestion(
    @Param('int_id') int_id: string,
    @Param('id') id: string,
    @Body() payload: QuestionPayload,
    @Req() req: ExpressRequest,
  ): Promise<Question> {
    const request = await this.request.findOneBy({
      id,
      interview: { id: int_id },
    });

    if (!request) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
    if (request.user.id !== req.user?.id) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    const question = this.question.create({
      content: payload.content,
      request: { id },
    });

    await this.question.save(question);

    return question;
  }

  @Put('/:int_id/:req_id/question/:id')
  @ApiBearerAuth()
  @UseGuards(AccessGuard)
  async updateRequestQuestions(
    @Param('int_id') int_id: string,
    @Param('req_id') req_id: string,
    @Param('id') id: string,
    @Body() payload: QuestionPayload,
    @Req() req: ExpressRequest,
  ): Promise<boolean> {
    const request = await this.request.findOneBy({
      id: req_id,
      interview: { id: int_id },
    });

    if (!request) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
    if (request.user.id !== req.user?.id) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    await this.question.update(id, {
      content: payload.content,
    });

    return true;
  }

  //#endregion

  //#region ChangeStatus

  @Put('/:int_id/:id/approve')
  @ApiBearerAuth()
  @UseGuards(AccessGuard)
  async approveRequest(
    @Param('int_id') int_id: string,
    @Param('id') id: string,
    @Req() req: ExpressRequest,
  ): Promise<UpdateResult> {
    const request = await this.request.findOne({
      where: {
        id,
        interview: { id: int_id },
      },
      relations: ['interview', 'interview.user'],
    });

    if (!request) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }

    const validation = this.service.validateUserPermissionWithRequest(
      req,
      ValidationRole.Interview,
      request,
    );

    if (!validation) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
    this.service.filterStatus(request.status, [RequestStatus.Pending]);

    return await this.request.update(id, {
      status: RequestStatus.Approved,
    });
  }

  @Put('/:int_id/:id/reject')
  @ApiBearerAuth()
  @UseGuards(AccessGuard)
  async rejectRequest(
    @Param('int_id') int_id: string,
    @Param('id') id: string,
    @Req() req: ExpressRequest,
  ): Promise<UpdateResult> {
    const request = await this.request.findOne({
      where: {
        id,
        interview: { id: int_id },
      },
      relations: ['interview', 'interview.user'],
    });

    if (!request) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }

    const validation = this.service.validateUserPermissionWithRequest(
      req,
      ValidationRole.Interview,
      request,
    );

    if (!validation) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
    this.service.filterStatus(request.status, [RequestStatus.Pending]);

    return await this.request.update(id, {
      status: RequestStatus.Rejected,
    });
  }

  @Put('/:int_id/:id/complete')
  @ApiBearerAuth()
  @UseGuards(AccessGuard)
  async completeRequest(
    @Param('int_id') int_id: string,
    @Param('id') id: string,
    @Req() req: ExpressRequest,
  ): Promise<boolean> {
    const request = await this.request.findOne({
      where: {
        id,
        interview: { id: int_id },
      },
      relations: ['user', 'interview', 'interview.user'],
    });

    if (!request) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }

    const validation = this.service.validateUserPermissionWithRequest(
      req,
      ValidationRole.Interview,
      request,
    );

    if (!validation) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
    this.service.filterStatus(request.status, [RequestStatus.Approved]);

    await this.request.update(id, {
      status: RequestStatus.Completed,
    });

    return true;
  }

  @Put('/:int_id/:id/:status')
  @ApiBearerAuth()
  @UseGuards(AccessGuard)
  async changeRequestStatus(
    @Param('int_id') int_id: string,
    @Param('id') id: string,
    @Param('status') status: RequestStatus,
    @Req() req: ExpressRequest,
  ): Promise<UpdateResult> {
    if (status === RequestStatus.Pending) {
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }

    const request = await this.request.findOne({
      where: {
        id,
        interview: { id: int_id },
      },
      relations: ['interview', 'interview.user'],
    });

    if (!request) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }

    const validation = this.service.validateUserPermissionWithRequest(
      req,
      ValidationRole.Interview,
      request,
    );

    if (!validation) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
    if (status === RequestStatus.Completed)
      this.service.filterStatus(request.status, [RequestStatus.Approved]);
    else this.service.filterStatus(request.status, [RequestStatus.Pending]);

    return await this.request.update(id, {
      status,
    });
  }

  //#endregion
}
