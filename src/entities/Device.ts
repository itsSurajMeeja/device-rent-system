import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './User';

@Entity()
export class Device {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: true })
  isAvailable: boolean;

  @ManyToOne(() => User, (user) => user.devices, { nullable: true })
  user: User | null;

  @Column({ type: 'timestamp', nullable: true })
  rentedAt: Date | null;
}
