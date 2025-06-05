import { Controller } from "@nestjs/common";
import { LibraryService } from "../../../library/src/library.service";

@Controller("library")
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  async getLibrary(): Promise<> {
    return;
  }
}
