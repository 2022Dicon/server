import { User } from 'src/profile/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Interview } from './interview.entity';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('int')
  score!: number;

  @Column('longtext')
  content!: string;

  @ManyToOne(() => Interview, (interview) => interview.comments)
  @JoinColumn()
  interview!: Interview;

  @ManyToOne(() => User, (user) => user.comments, {
    eager : true
  })
  @JoinColumn()
  user!: User;
}
