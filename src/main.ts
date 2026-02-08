import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import helmet from "helmet";
import * as dotenv from "dotenv";
import { Logger } from "./common/logger/logger.service";
import { TransformInterceptor } from "./common/interceptors/transform.interceptor";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";

async function bootstrap() {
  dotenv.config();
  const logger = new Logger("Main");

  const app = await NestFactory.create(AppModule, {
    logger: logger,
  });

  // Security
  app.use(helmet());
  app.enableCors();

  // Global Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global Interceptors & Filters
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  const port = process.env.PORT || 3000;
  await app.listen(port, "0.0.0.0");
  logger.success(`OneVault Backend is running on: http://localhost:${port}`);
}
bootstrap();
