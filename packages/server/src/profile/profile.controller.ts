import { Controller, Get, Param, Put } from '@nestjs/common';

@Controller('profile')
export class ProfileController {
  @Get('/me')
  getProfile(): string {
    return 'Profile';
  }

  @Get('/:uuid')
  getProfileById(@Param('uuid') uuid: string): string {
    return `Profile: uuid=${uuid}`;
  }

  @Put('/me')
  updateProfile(): string {
    return 'Update profile';
  }
}
