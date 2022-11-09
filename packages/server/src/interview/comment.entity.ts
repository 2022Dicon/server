import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Interview } from './interview.entity';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Interview, (interview) => interview.comments)
  @JoinColumn()
  interview!: Interview;
}
