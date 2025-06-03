import { DocumentBuilder } from "@nestjs/swagger";

export const swaggerConfig = new DocumentBuilder()
  .setTitle("BookBuddy API Library Service")
  .setDescription("API documentation for BookBuddy Library Service")
  .setVersion("1.0")
  .addBearerAuth()
  .build();
