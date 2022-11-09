import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import Request from 'src/request/request.entity';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { User } from './user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Request])],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
