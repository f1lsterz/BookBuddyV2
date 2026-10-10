import { IsMongoId } from "class-validator";

/** HTTP body when club id is in the route. */
export class AddClubMemberDto {
  @IsMongoId()
  userId: string;
}

export class ClubIdUserIdRpcDto {
  @IsMongoId()
  clubId: string;

  @IsMongoId()
  userId: string;
}

export class ClubUserMembershipRpcDto {
  @IsMongoId()
  userId: string;

  @IsMongoId()
  clubId: string;
}

export class ClubIdActorRpcDto {
  @IsMongoId()
  clubId: string;

  @IsMongoId()
  actorId: string;
}

export class ClubMemberChangeRpcDto {
  @IsMongoId()
  clubId: string;

  @IsMongoId()
  userId: string;

  @IsMongoId()
  actorId: string;
}
