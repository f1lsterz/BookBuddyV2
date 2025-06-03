import { ValidationPipe } from "@nestjs/common";

export const validationConfig = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  transformOptions: {
    enableImplicitConversion: true,
  },
  forbidUnknownValues: true,
  validationError: {
    target: false,
    value: false,
  },
});
