import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request as ExpressRequest } from 'express';
import { Interview } from 'src/interview/interview.entity';
import { User } from 'src/profile/user.entity';
import { Repository } from 'typeorm';
import Question from './question.entity';
import Request, { RequestStatus } from './request.entity';

export enum ValidationRole {
  Request = 'request',
  Interview = 'interview',
  RequestOrInterview = 'requestOrInterview',
  RequestAndInterview = 'requestAndInterview',
}

@Injectable()
export class RequestService {
  constructor(
    @InjectRepository(Interview)
    private readonly interview: Repository<Interview>,
    @InjectRepository(Request)
    private readonly request: Repository<Request>,
    @InjectRepository(Question)
    private readonly question: Repository<Question>,
    @InjectRepository(User)
    private readonly user: Repository<User>,
  ) {}

  async validateUserPermission(
    request: ExpressRequest,
    role: ValidationRole,
    interviewId: string,
    requestId: string,
  ) {
    const requestValidation = await this.validateRequestPermission(
      request,
      interviewId,
      requestId,
    );
    const interviewValidation = await this.validateInterviewPermission(
      request,
      interviewId,
    );
    const count = [requestValidation, interviewValidation].filter(
      (v) => v === true,
    ).length;

    switch (role) {
      case ValidationRole.Request:
        return requestValidation;
      case ValidationRole.Interview:
        return interviewValidation;
      case ValidationRole.RequestOrInterview:
        return count > 0;
      case ValidationRole.RequestAndInterview:
        return count === 2;
    }
  }

  private async validateRequestPermission(
    req: ExpressRequest,
    interviewId: string,
    requestId: string,
  ) {
    const user = req.user!;
    const request = await this.request.findOneBy({
      id: requestId,
      interview: { id: interviewId },
    });

    if (!request) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }

    if (request.user.id !== user.id) {
      return false;
    }

    return true;
  }

  private async validateInterviewPermission(
    req: ExpressRequest,
    interviewId: string,
  ) {
    const user = req.user!;
    const interview = await this.interview.findOneBy({ id: interviewId });

    if (!interview) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }

    if (interview.user.id !== user.id) {
      return false;
    }

    return true;
  }

  async validateUserPermissionWithRequest(
    req: ExpressRequest,
    role: ValidationRole,
    request: Request,
  ) {
    const requestValidation = await this.validateRequestPermissionWithRequest(
      req,
      request,
    );
    const interviewValidation =
      await this.validateInterviewPermissionWithRequest(req, request);
    const count = [requestValidation, interviewValidation].filter(
      (v) => v === true,
    ).length;

    switch (role) {
      case ValidationRole.Request:
        return requestValidation;
      case ValidationRole.Interview:
        return interviewValidation;
      case ValidationRole.RequestOrInterview:
        return count > 0;
      case ValidationRole.RequestAndInterview:
        return count === 2;
    }
  }

  private async validateRequestPermissionWithRequest(
    req: ExpressRequest,
    request: Request,
  ) {
    const user = req.user!;

    if (request.user.id !== user.id) {
      return false;
    }

    return true;
  }

  private async validateInterviewPermissionWithRequest(
    req: ExpressRequest,
    request: Request,
  ) {
    const user = req.user!;
    const interview = request.interview;

    if (interview.user.id !== user.id) {
      return false;
    }

    return true;
  }

  async filterStatus(
    status: RequestStatus | string,
    filter: string[],
    isWhitelist = true,
  ): Promise<void> {
    if (isWhitelist) {
      if (!filter.includes(status)) throwStatus(status);
    } else {
      if (filter.includes(status)) throwStatus(status);
    }

    return;

    function throwStatus(status: RequestStatus | string) {
      switch (status) {
        case RequestStatus.Pending:
          throw new HttpException('Not yet accepted', HttpStatus.BAD_REQUEST);
        case RequestStatus.Approved:
          throw new HttpException('Already approved', HttpStatus.BAD_REQUEST);
        case RequestStatus.Rejected:
          throw new HttpException('Already rejected', HttpStatus.BAD_REQUEST);
        case RequestStatus.Completed:
          throw new HttpException('Already completed', HttpStatus.BAD_REQUEST);
      }
    }
  }
}
