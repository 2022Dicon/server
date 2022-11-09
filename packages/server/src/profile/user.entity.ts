import { Comment } from 'src/interview/comment.entity';
import { Interview } from 'src/interview/interview.entity';
import Request from 'src/request/request.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('varchar', { length: 255, unique: true })
  email!: string;

  @Column('varchar', { length: 255 })
  name!: string;

  @Column('uuid', { default: '4ed96cc1-9b23-47e8-acdc-7f6f8ded05be' })
  image!: string;

  @Column('varchar', { length: 255, nullable: true })
  job!: string;

  @Column('text', { nullable: true })
  description!: string;

  @OneToMany(() => Interview, (interview) => interview.user)
  interviews!: Interview[];

  @OneToMany(() => Request, (request) => request.user)
  requests!: Request[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments!: Comment[];
}
