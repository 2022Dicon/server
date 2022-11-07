import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('text')
  email!: string;

  @Column('text')
  name!: string;

  @Column('uuid')
  image!: string;

  // ToDo
}
