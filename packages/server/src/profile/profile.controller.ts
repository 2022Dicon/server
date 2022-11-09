import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiProperty } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Request as ExpressRequest } from 'express';
import { AccessGuard } from 'src/auth/guards/access.guard';
import Request from 'src/request/request.entity';
import { Repository } from 'typeorm';
import { User } from './user.entity';

export class UserPayload {
  @ApiProperty({
    name: 'name',
    description: 'User name',
  })
  name!: string;

  @ApiProperty({
    name: 'image',
    description: 'User image',
  })
  image!: string;

  @ApiProperty({
    name: 'job',
    description: 'User job',
  })
  job!: string;

  @ApiProperty({
    name: 'description',
    description: 'User description',
  })
  description!: string;
}

@Controller('profile')
export class ProfileController {
  constructor(
    @InjectRepository(User)
    private readonly user: Repository<User>,
    @InjectRepository(Request)
    private readonly request: Repository<Request>,
  ) {}

  @Get('/me')
  @ApiBearerAuth()
  @UseGuards(AccessGuard)
  async getProfile(@Req() req: ExpressRequest): Promise<User> {
    const user = await this.user.findOne({
      where: { id: req.user?.id },
      relations: ['interviews', 'requests'],
    });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  @Get('/:uuid')
  @ApiBearerAuth()
  @UseGuards(AccessGuard)
  async getProfileById(@Param('uuid') uuid: string): Promise<User> {
    const user = await this.user.findOne({
      where: { id: uuid },
      relations: ['interviews', 'requests'],
    });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  @Put('/me')
  @ApiBearerAuth()
  @ApiBody({ type: UserPayload })
  @UseGuards(AccessGuard)
  async updateProfile(
    @Body('name') name: string,
    @Body('image') image: string,
    @Body('job') job: string,
    @Body('description') description: string,
    @Req() req: ExpressRequest,
  ): Promise<boolean> {
    await this.user.update(req.user!.id, {
      name,
      image,
      job,
      description,
    });

    return true;
  }

  @Get('/requests/incoming')
  @ApiBearerAuth()
  @UseGuards(AccessGuard)
  async getIncomingRequests(@Req() req: ExpressRequest): Promise<Request[]> {
    const requests = await this.request.findBy({
      interview: {
        user: {
          id: req.user?.id,
        },
      },
    });
    return requests;
  }

  @Get('/requsets/outgoing')
  @ApiBearerAuth()
  @UseGuards(AccessGuard)
  async getOutgoingRequests(@Req() req: ExpressRequest): Promise<Request[]> {
    const user = await this.user.findOne({
      where: { id: req.user?.id },
      relations: ['requests'],
    });
    return user?.requests ?? [];
  }
}
