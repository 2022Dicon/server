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
import Record from './record.entity';

export enum RequestCategory {
  Online = 'online',
  Offline = 'offline',
}

export enum RequestStatus {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
  Completed = 'completed',
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

  @Column({
    type: 'enum',
    enum: RequestStatus,
    default: RequestStatus.Pending,
  })
  status!: string;

  @DeleteDateColumn({ select: false })
  deletedAt!: Date;

  @OneToMany(() => Question, (question) => question.request, {
    cascade: true,
    eager: true,
  })
  questions!: Question[];

  @OneToMany(() => Record, (record) => record.request, {
    cascade: true,
    eager: true,
  })
  records!: Record[];

  @ManyToOne(() => Interview, (interview) => interview.requests)
  interview!: Interview;

  @ManyToOne(() => User, (user) => user.requests, {
    eager: true,
  })
  user!: User;
}
