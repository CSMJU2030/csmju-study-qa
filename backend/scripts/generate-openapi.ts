import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Writes backend/openapi.json from the controllers (tech-stack.md ข้อ 3).
 * `preview` builds the route table without creating providers, so no database
 * or Core Hub is needed.
 */
async function main(): Promise<void> {
  // ConfigModule.forRoot validates the env while app.module loads, so the
  // placeholder must exist before that import (CI has no .env — API-01)
  process.env.DATABASE_URL ??= 'postgresql://localhost/openapi_only';
  const { ROUTES_OUTSIDE_API_PREFIX } = await import('../src/app-setup');
  const { AppModule } = await import('../src/app.module');

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    preview: true,
    logger: false,
    abortOnError: false,
  });
  app.setGlobalPrefix('api', { exclude: ROUTES_OUTSIDE_API_PREFIX });

  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('CSMJU Helpdesk API')
      .setDescription('กระดานถาม-ตอบ สาขาวิทยาการคอมพิวเตอร์ — ระบบย่อยของ CSMJU2030')
      .setVersion('1.0.0')
      .addBearerAuth()
      .addCookieAuth('csmju_study_qa_access_token')
      .build(),
  );

  writeFileSync(resolve(process.cwd(), 'openapi.json'), `${JSON.stringify(document, null, 2)}\n`);
  await app.close();
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
