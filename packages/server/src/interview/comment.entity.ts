import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Interview } from './interview.entity';

@Entity()
export class Comment {
  @ManyToOne(() => Interview, (interview) => interview.comments)
  @JoinColumn()
  interview!: Interview;
}
