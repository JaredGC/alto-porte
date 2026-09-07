import { Entity, Column, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '@Core/Entities/base.entity';
import { User } from '@User/Entities/user.entitiy';

@Entity('deals__leads')
export class Lead extends BaseEntity {
    @Column({ type: 'varchar', length: 255, nullable: false })
    name: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    email?: string;

    @Column({ type: 'varchar', length: 25, nullable: false })
    phone: string;

    @Column({ type: 'varchar', length: 25, nullable: false })
    source: string;

    @Column({ type: 'integer', nullable: false })
    status: number; // 1: Nuevo, 2: Contactado, 3: Calificado, 4: Reservado, 5: Descartado

    @Column({ type: 'float', nullable: false })
    budget: number;

    @Column({ type: 'varchar', length: 25, nullable: false })
    project: string;

    @Column({ type: 'integer', nullable: true })
    agent_id?: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'agent_id', referencedColumnName: 'id' })
    agent?: User;
}