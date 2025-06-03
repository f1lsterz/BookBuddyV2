import { DocumentBuilder } from "@nestjs/swagger";

export const swaggerConfig = new DocumentBuilder()
  .setTitle("BookBuddy API Auth Service")
  .setDescription("API documentation for BookBuddy Auth Service")
  .setVersion("1.0")
  .addBearerAuth()
  .build();
