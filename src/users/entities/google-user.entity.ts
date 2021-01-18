import { ChildEntity, Column } from 'typeorm';
import { User } from './user.entity';

@ChildEntity()
export class GoogleUser extends User {
  @Column({
    type: 'varchar',
    nullable: false,
  })
  googleId: string;
}
