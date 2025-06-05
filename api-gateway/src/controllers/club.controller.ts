import { Controller } from "@nestjs/common";
import { ClubService } from "../../../club/src/club.service";

@Controller("club")
export class ClubController {
  constructor(private readonly clubService: ClubService) {}
}
