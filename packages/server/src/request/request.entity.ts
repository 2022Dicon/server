import { InterviewCategory } from 'src/interview/interview.entity';
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

@Entity()
export default class Request {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  thumbnail!: string;

  @Column('varchar', { length: 255 })
  title!: string;

  @Column({
    type: 'enum',
    enum: InterviewCategory,
  })
  category!: string;

  @Column('date')
  date!: Date;

  @Column('text')
  location!: string;

  @Column('bool')
  completed!: boolean;

  @DeleteDateColumn()
  deletedAt!: Date;

  @OneToMany(() => Question, (question) => question.request, {
    cascade: true,
    eager: true,
  })
  questions!: Question[];

  @ManyToOne(() => User, (user) => user.requests)
  user!: User;
}
