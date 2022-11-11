import { User } from 'src/profile/user.entity';
import Request from 'src/request/request.entity';
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
  Any = 'any',
}

@Entity()
export class Interview {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('varchar', { length: 255 })
  title!: string;

  @Column('uuid')
  thumbnail!: string;

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

  @ManyToOne(() => User, (user) => user.interviews, {
<<<<<<< HEAD
    eager : true
  }) 
=======
    eager: true,
  })
>>>>>>> 14f19b4a9aa6948003f51af45200cf2448d5240a
  @JoinColumn()
  user!: User;

  @OneToMany(() => Comment, (comment) => comment.interview, {
    cascade: true,
    eager: true,
  })
  @JoinColumn()
  comments!: Comment[];

  @OneToMany(() => Request, (request) => request.interview, {
    cascade: true,
  })
  @JoinColumn()
  requests!: Request[];
}
