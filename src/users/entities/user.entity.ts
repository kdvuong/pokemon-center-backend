import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  TableInheritance,
  Unique,
} from 'typeorm';

@Entity()
@Unique(['name', 'tag'])
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  email: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  name: string;

  @Column({
    type: 'smallint',
    nullable: false,
  })
  tag: number;
}
