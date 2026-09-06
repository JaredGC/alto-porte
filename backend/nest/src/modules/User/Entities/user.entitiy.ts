import { Entity, Column, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '@Core/Entities/base.entity';
import { Role } from './role.entity';

@Entity('users')
export class User extends BaseEntity {
    @Column({ type: 'varchar', length: 255, nullable: true, unique: false })
    name: string;

    @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
    email: string;

    @Column({ type: 'text', select: true})
    password: string;

    @Column({ type: 'text', nullable: false, unique: true })
    access_token: string;

    @Column({ type: 'integer', nullable: false, unique: false })
    role_id: number;

    @Column({ type: 'boolean', default: false })
    registered: boolean;

    @ManyToOne(() => Role)
    @JoinColumn({ name: 'role_id', referencedColumnName: 'id' })
    role: Role;

}