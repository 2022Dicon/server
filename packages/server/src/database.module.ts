import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from './profile/user.entity';
import { Interview } from './interview/interview.entity';
import { Comment } from './interview/comment.entity';
import Request from './request/request.entity';
import Question from './request/question.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST'),
        port: parseInt(config.get('DB_PORT') ?? '3306'),
        database: config.get<string>('DB_NAME'),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        entities: [User, Interview, Comment, Request, Question],
        migrations: [],
        subscribers: [],
        synchronize: true,
        charset: 'utf8_general_ci',
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
