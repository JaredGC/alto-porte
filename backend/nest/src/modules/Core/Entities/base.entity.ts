import { PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export abstract class BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn({
        type: 'timestamp',
        default: () => "timezone('America/El_Salvador', now())",
    })
    created_at: Date;

    @UpdateDateColumn({
        type: 'timestamp',
        default: () => "timezone('America/El_Salvador', now())",
    })
    updated_at: Date;
}