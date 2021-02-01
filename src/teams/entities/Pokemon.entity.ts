import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Team } from './Team.entity';

@Entity()
export class Pokemon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  pokemon_id: string;

  @ManyToOne(() => Team, (team) => team.pokemons)
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @Column()
  nickname: string;

  @Column()
  ability_id: number;

  @Column()
  level: number;

  @Column()
  gender: string;

  @Column()
  nature_id: number;

  @Column()
  shiny: boolean;

  @Column('int', { array: true })
  moves: number[];

  @Column()
  hp_ev: number;

  @Column()
  attack_ev: number;

  @Column()
  defense_ev: number;

  @Column()
  special_attack_ev: number;

  @Column()
  special_defense_ev: number;

  @Column()
  speed_ev: number;

  @Column()
  hp_iv: number;

  @Column()
  attack_iv: number;

  @Column()
  defense_iv: number;

  @Column()
  special_attack_iv: number;

  @Column()
  special_defense_iv: number;

  @Column()
  speed_iv: number;
}
