import { DocumentBuilder } from "@nestjs/swagger";

export const swaggerConfig = new DocumentBuilder()
  .setTitle("BookBuddy API Book Service")
  .setDescription("API documentation for BookBuddy Book Service")
  .setVersion("1.0")
  .addBearerAuth()
  .build();
