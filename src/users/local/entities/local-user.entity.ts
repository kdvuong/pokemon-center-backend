import { hash } from 'bcrypt';
import { BeforeInsert, ChildEntity, Column } from 'typeorm';
import { User } from '../../entities/user.entity';

@ChildEntity()
export class LocalUser extends User {
  @Column({
    type: 'varchar',
    nullable: false,
  })
  password: string;

  @BeforeInsert()
  async hashPassword() {
    this.password = await hash(this.password, 10);
  }
}
