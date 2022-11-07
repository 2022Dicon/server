import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ApiBody, ApiProperty } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { User } from 'src/profile/user.entity';
import { Repository } from 'typeorm';
import { AccessGuard } from './guards/access.guard';

class LoginPayload {
  @ApiProperty({
    name: 'token',
    description: 'Google OAuth2 token',
  })
  token!: string;
}

class RegistPayload {
  @ApiProperty({
    name: 'token',
    description: 'Google OAuth2 token',
  })
  token!: string;

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
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly user: Repository<User>,
  ) {}

  @Get('/')
  @UseGuards(AccessGuard)
  async auth() {
    return 'Hello World!';
  }

  @Post('/login')
  @ApiBody({ type: LoginPayload })
  async login(@Body('token') token: string) {
    const clinetId = this.config.get('GOOGLE_CLIENT_ID');
    const oauthClient = new OAuth2Client(clinetId);
    const ticket = await oauthClient
      .verifyIdToken({
        idToken: token,
      })
      .catch(() => null);
    if (!ticket)
      throw new HttpException('Invalid token', HttpStatus.BAD_REQUEST);
    const { email } = ticket!.getPayload()!;
    const user = await this.user.findOneBy({ email });
    if (!user) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    const accessToken = await this.jwtService.signAsync(
      { id: user.id },
      {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: this.config.get('JWT_EXPIRES_IN'),
      },
    );
    return accessToken;
  }

  @Post('/regist')
  @ApiBody({ type: RegistPayload })
  async regist(
    @Body('token') token: string,
    @Body('name') name: string,
    @Body('image') image: string,
  ) {
    const clinetId = this.config.get('GOOGLE_CLIENT_ID');
    const oauthClient = new OAuth2Client(clinetId);
    const ticket = await oauthClient
      .verifyIdToken({
        idToken: token,
      })
      .catch(() => null);
    if (!ticket)
      throw new HttpException('Invalid token', HttpStatus.BAD_REQUEST);
    const { email } = ticket!.getPayload()!;
    const user = await this.user.create({ email, name, image });
    await this.user.save(user);
    const accessToken = await this.jwtService.signAsync(
      { id: user.id },
      {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: this.config.get('JWT_EXPIRES_IN'),
      },
    );
    return accessToken;
  }
}
