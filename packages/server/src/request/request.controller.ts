import { Controller, Param } from '@nestjs/common';
import {
  Delete,
  Get,
  Post,
  Put,
} from '@nestjs/common/decorators/http/request-mapping.decorator';

@Controller('request')
export class RequestController {
  @Get('/')
  getRequests(): string {
    return 'Requests';
  }

  @Get('/:id')
  getRequest(@Param('id') id: string): string {
    return `Request: id=${id}`;
  }

  @Post('/')
  createRequest(): string {
    return 'Create request';
  }

  @Delete('/:id')
  deleteRequest(@Param('id') id: string): string {
    return `Delete request: id=${id}`;
  }

  // Question

  @Get('/:id/question')
  getRequestQuestions(@Param('id') id: string): string {
    return `Request questions: id=${id}`;
  }

  @Put('/:id/question')
  updateRequestQuestions(@Param('id') id: string): string {
    return `Update request questions: id=${id}`;
  }
}
