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
import { Request } from 'express';
import { AccessGuard } from 'src/auth/guards/access.guard';
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
  ) {}

  @Get('/me')
  @ApiBearerAuth()
  @UseGuards(AccessGuard)
  getProfile(@Req() req: Request): User {
    return req.user!;
  }

  @Get('/:uuid')
  async getProfileById(@Param('uuid') uuid: string): Promise<User> {
    const user = await this.user.findOneBy({ id: uuid });
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
    @Req() req: Request,
  ): Promise<boolean> {
    const user = req.user!;

    await this.user.update(user.id, {
      name,
      image,
      job,
      description,
    });

    return true;
  }
}
