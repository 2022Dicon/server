import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import Request from './request.entity';

@Entity()
export default class Question {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('text')
  content!: string;

  @ManyToOne(() => Request, (request) => request.questions)
  request!: Request;
}
