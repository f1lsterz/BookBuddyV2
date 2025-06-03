import { DocumentBuilder } from "@nestjs/swagger";

export const swaggerConfig = new DocumentBuilder()
  .setTitle("BookBuddy API Chat Service")
  .setDescription("API documentation for BookBuddy Chat Service")
  .setVersion("1.0")
  .addBearerAuth()
  .build();
