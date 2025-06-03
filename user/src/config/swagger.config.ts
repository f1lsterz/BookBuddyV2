import { DocumentBuilder } from "@nestjs/swagger";

export const swaggerConfig = new DocumentBuilder()
  .setTitle("BookBuddy API User Service")
  .setDescription("API documentation for BookBuddy User Service")
  .setVersion("1.0")
  .addBearerAuth()
  .build();
