import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database.module';
import { InterviewModule } from './interview/interview.module';
import { RequestModule } from './request/request.module';
import { ProfileModule } from './profile/profile.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`../../.env`, `.env`],
    }),
    DatabaseModule,
    InterviewModule,
    RequestModule,
    ProfileModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
