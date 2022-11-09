import { User } from 'src/profile/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Comment } from './comment.entity';

export enum InterviewCategory {
  Online = 'online',
  Offline = 'offline',
}

@Entity()
export class Interview {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  thumbnail!: string;

  // ToDo: add user column

  @Column('varchar', { length: 255 })
  title!: string;

  @Column('int')
  amount!: number;

  @Column({
    type: 'enum',
    enum: InterviewCategory,
    default: InterviewCategory.Online,
  })
  category!: string;

  @Column('int')
  field!: number;

  @Column('longtext')
  description!: string;

  @ManyToOne(() => User, (user) => user.interviews)
  @JoinColumn()
  user!: User;

  @OneToMany(() => Comment, (comment) => comment.interview, {
    cascade: true,
    eager: true,
  })
  @JoinColumn()
  comments!: Comment[];
}
