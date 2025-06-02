import { DocumentBuilder } from "@nestjs/swagger";

export const swaggerConfig = new DocumentBuilder()
  .setTitle("BookBuddy API")
  .setDescription("API documentation for BookBuddy application")
  .setVersion("1.0")
  .addBearerAuth()
  .build();
