# Pruebas del backend

Ejecutar desde `backend/nest`:

```bash
npm test -- --runInBand
npm run test:e2e -- --runInBand
npm run test:cov -- --runInBand
```

Las pruebas unitarias cubren las métricas y caché del dashboard, login con bcrypt,
autorización por token y rol, operaciones de leads y registro de usuarios.

Las pruebas HTTP cargan `AppModule`, sus controladores, servicios y guards reales.
Simulan los repositorios y desactivan la conexión de TypeORM únicamente en Jest.
No necesitan PostgreSQL y no leen ni escriben registros de tu base de datos.
Verifican respuestas HTTP, permisos e invalidación y regeneración de la caché.

El prefijo `/api` se configura en la aplicación de prueba, igual que en `main.ts`.
Si cambias el prefijo de producción, actualiza también el montaje de las pruebas.

Estas pruebas no verifican consultas SQL, restricciones de PostgreSQL,
sincronización del esquema ni serialización al guardar el JSON en la base de datos.
El comando `test:e2e` contiene pruebas de integración HTTP con persistencia simulada.

Jest tiene configurados los alias de TypeScript y la transformación a CommonJS de
`@nestjs/config` y `@nestjs/typeorm`, que se distribuyen como ESM. El archivo
`esm-compat.transformer.cjs` adapta `import.meta.url` de TypeORM al ejecutar pruebas
en Node 22; no modifica las dependencias ni el build de producción. Esta adaptación
usa el mecanismo de [transformación de Jest](https://jestjs.io/docs/code-transformation).
