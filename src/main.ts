import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  const swaggerConfig = new DocumentBuilder()
    .setTitle('API Consistem')
    .setDescription('API documentation for Consistem integrations')
    .setVersion('1.0.0')
    .build();
  const documentFactory = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, documentFactory, {
    jsonDocumentUrl: '/api/docs-json',
  });

  app.enableCors({
    origin: true,
    methods: 'GET',
    credentials: true,
  });

  await app.listen(3311);
}
bootstrap();
