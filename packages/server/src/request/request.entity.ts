import { Interview, InterviewCategory } from 'src/interview/interview.entity';
import { User } from 'src/profile/user.entity';
import {
  AfterLoad,
  Column,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import Question from './question.entity';

export enum RequestCategory {
  Online = 'online',
  Offline = 'offline',
}

@Entity()
export default class Request {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('varchar', { length: 255 })
  title!: string;

  @Column('uuid', { default: '' })
  thumbnail!: string;

  @Column({
    type: 'enum',
    enum: RequestCategory,
    default: RequestCategory.Online,
  })
  category!: string;

  @Column('datetime', { nullable: true })
  date!: Date;

  @Column('text', { nullable: true })
  location!: string;

  @Column('bool', { default: false })
  completed!: boolean;

  @DeleteDateColumn({ select: false })
  deletedAt!: Date;

  @OneToMany(() => Question, (question) => question.request, {
    cascade: true,
    eager: true,
  })
  questions!: Question[];

  @ManyToOne(() => Interview, (interview) => interview.requests)
  interview!: Interview;

  @ManyToOne(() => User, (user) => user.requests)
  user!: User;
}
