import { DocumentBuilder } from "@nestjs/swagger";

export const swaggerConfig = new DocumentBuilder()
  .setTitle("BookBuddy API Club Service")
  .setDescription("API documentation for BookBuddy Club Service")
  .setVersion("1.0")
  .addBearerAuth()
  .build();
