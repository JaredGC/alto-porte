import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DataSource, In } from 'typeorm';
import { AppModule } from '../app.module';
import { Lead } from '@Deals/Entities/lead.entitiy';
import { Dashboard } from '@Dashboard/Entities/dashboard.entitiy';
import { leadsData, leadStatuses } from './leads.data';

export async function seedLeads(dataSource: DataSource) {
  return dataSource.transaction(async (manager) => {
    const leadRepo = manager.getRepository(Lead);
    const existing = await leadRepo.find({
      where: { email: In(leadsData.map((lead) => lead.email)) },
      select: { email: true },
    });
    const existingEmails = new Set(existing.map((lead) => lead.email));
    const missing = leadsData
      .filter((lead) => !existingEmails.has(lead.email))
      .map(({ status, createdAt, ...lead }) =>
        leadRepo.create({
          ...lead,
          status: leadStatuses[status],
          // The column is a timestamp without time zone: preserve the supplied
          // calendar date at local midnight, without a UTC date conversion.
          created_at: new Date(`${createdAt}T00:00:00`),
        }),
      );

    if (missing.length > 0) {
      await leadRepo.save(missing);
      await manager
        .getRepository(Dashboard)
        .update({ syncronized: true }, { syncronized: false });
    }

    return {
      created: missing.length,
      skipped: leadsData.length - missing.length,
    };
  });
}

async function main() {
  // Reuse the backend's database configuration without opening an HTTP port.
  const app = await NestFactory.createApplicationContext(AppModule, {
    abortOnError: false,
  });
  try {
    const result = await seedLeads(app.get(DataSource));
    console.log(
      `Leads creados: ${result.created}. Ya existentes: ${result.skipped}.`,
    );
  } finally {
    await app.close();
  }
}

if (require.main === module) {
  main().catch((error: unknown) => {
    console.error('No se pudo ejecutar el seeder de leads:', error);
    process.exitCode = 1;
  });
}
