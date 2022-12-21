import { Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import Request from './request.entity';

@Entity()
export default class Record {
  @PrimaryColumn('uuid')
  id!: string;

  @ManyToOne(() => Request, (request) => request.questions)
  request!: Request;
}
