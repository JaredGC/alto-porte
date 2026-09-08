import 'reflect-metadata';
import { randomBytes } from 'node:crypto';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../app.module';
import { User } from '@User/Entities/user.entitiy';
import { Role } from '@User/Entities/role.entity';
import { RolesMap } from '@Core/Guard/roles-map';

interface AdminSeedOptions {
  name: string;
  email: string;
  password: string;
}

export async function seedAdmin(
  dataSource: DataSource,
  options: AdminSeedOptions,
) {
  const name = options.name.trim();
  const email = options.email.trim();
  if (!name || !email || !options.password) {
    throw new Error(
      'Configura SEED_ADMIN_NAME, SEED_ADMIN_EMAIL y SEED_ADMIN_PASSWORD.',
    );
  }

  return dataSource.transaction(async (manager) => {
    const users = manager.getRepository(User);
    const existing = await users.findOne({ where: { email } });
    if (existing) {
      if (existing.role_id !== RolesMap.admin) {
        throw new Error(
          'El correo ya pertenece a un usuario con otro rol. Usa otro SEED_ADMIN_EMAIL.',
        );
      }
      return { created: false, id: existing.id, email: existing.email };
    }

    const roles = manager.getRepository(Role);
    const matches = await roles.find({
      where: [{ id: RolesMap.admin }, { slug: 'admin' }],
    });
    if (
      matches.some(
        (role) => role.id !== RolesMap.admin || role.slug !== 'admin',
      )
    ) {
      throw new Error(
        'El rol admin debe tener ID 2 según RolesMap. Revisa los roles existentes.',
      );
    }
    if (matches.length === 0) {
      // save() omits auto-generated IDs on PostgreSQL inserts. Specify the
      // columns explicitly so the role ID matches the authorization map.
      await roles
        .createQueryBuilder()
        .insert()
        .into(Role, ['id', 'name', 'slug'])
        .values({ id: RolesMap.admin, name: 'Admin', slug: 'admin' })
        .execute();
      // Explicit IDs do not advance PostgreSQL's sequence. Keep future role IDs
      // above existing rows without moving an already advanced sequence back.
      await manager.query(`
        SELECT setval(
          pg_get_serial_sequence('roles', 'id'),
          GREATEST(
            (SELECT MAX(id) FROM roles),
            nextval(pg_get_serial_sequence('roles', 'id'))
          ),
          true
        )
      `);
    }

    const user = await users.save(
      users.create({
        name,
        email,
        password: await bcrypt.hash(options.password, 10),
        access_token: randomBytes(32).toString('hex'),
        role_id: RolesMap.admin,
        registered: true,
      }),
    );
    return { created: true, id: user.id, email: user.email };
  });
}

async function main() {
  const options = {
    name: process.env.SEED_ADMIN_NAME || 'Administrador',
    email: process.env.SEED_ADMIN_EMAIL || 'admin@example.com',
    password: process.env.SEED_ADMIN_PASSWORD || '',
  };
  if (!options.password) {
    throw new Error(
      'Define SEED_ADMIN_PASSWORD en tu .env antes de ejecutar el seeder.',
    );
  }
  const app = await NestFactory.createApplicationContext(AppModule, {
    abortOnError: false,
  });
  try {
    const result = await seedAdmin(app.get(DataSource), options);
    console.log(
      result.created
        ? `Administrador creado: ${result.email}.`
        : `El administrador ${result.email} ya existe; se conservaron sus datos.`,
    );
  } finally {
    await app.close();
  }
}

if (require.main === module) {
  main().catch((error: unknown) => {
    // Database errors can include query parameters containing credentials.
    const message =
      error instanceof Error ? error.message : 'Error desconocido';
    console.error(`No se pudo ejecutar el seeder de admin: ${message}`);
    process.exitCode = 1;
  });
}
