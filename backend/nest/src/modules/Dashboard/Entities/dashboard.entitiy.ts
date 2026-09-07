import { Entity, Column } from 'typeorm';
import { BaseEntity } from '@Core/Entities/base.entity';

@Entity('dashboard__dashboard')
export class Dashboard extends BaseEntity {
    @Column({ type: 'text', nullable: false })
    json: any;

    @Column({ type: 'boolean', nullable: false })
    syncronized: boolean;
}