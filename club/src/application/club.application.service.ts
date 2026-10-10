import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import { Cache } from "cache-manager";
import { ClubDocument, ClubRole } from "../../schemas/club.schema";
import { CACHE_CLUBS } from "../config/cache.keys";
import { ClubMembershipPolicy } from "../domain/club-membership.policy";
import { ClubRepository } from "../infrastructure/club.repository";
import { DomainEventOutboxService } from "../infrastructure/domain-event-outbox.service";

@Injectable()
export class ClubApplicationService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly clubRepository: ClubRepository,
    private readonly domainEventOutbox: DomainEventOutboxService,
  ) {}

  async createBookClub(
    name: string,
    description: string,
    userId: string,
    imageFile?: { filename?: string },
  ) {
    const inAny = !!(await this.clubRepository.findMembershipByUser(userId));
    ClubMembershipPolicy.assertUserNotInAnyClub(inAny);

    const gatewayBaseUrl = process.env.GATEWAY_URL || "http://localhost:3000";
    const imageUrl = imageFile
      ? `${gatewayBaseUrl}/uploads/${imageFile.filename}`
      : undefined;

    const { club } = await this.clubRepository.createClubWithAdmin({
      name,
      description,
      userId,
      imageUrl,
    });

    await this.cacheManager.del(CACHE_CLUBS.ALL_CLUBS);
    return club;
  }

  async searchClubs(query?: string, filterFull?: boolean) {
    const maxMembers = Number(process.env.MAX_MEMBER_COUNT) || 50;
    const cacheKey = CACHE_CLUBS.SEARCH_CLUBS(query || "", filterFull || false);
    const cached = await this.cacheManager.get<ClubDocument[]>(cacheKey);
    if (cached) return cached;

    const filter: Record<string, unknown> = {};
    if (query) filter.name = { $regex: query, $options: "i" };
    if (filterFull) filter.memberCount = { $lt: maxMembers };

    const clubs = await this.clubRepository.search(filter);
    await this.cacheManager.set(cacheKey, clubs, 3600);
    return clubs;
  }

  async getAllClubs() {
    const cacheKey = CACHE_CLUBS.ALL_CLUBS;
    const cached = await this.cacheManager.get<ClubDocument[]>(cacheKey);
    if (cached) return cached;

    const clubs = await this.clubRepository.findAll();
    await this.cacheManager.set(cacheKey, clubs, 3600);
    return clubs;
  }

  async getClub(clubId: string) {
    const cacheKey = CACHE_CLUBS.CLUB(clubId);
    const cached = await this.cacheManager.get<ClubDocument>(cacheKey);
    if (cached) return cached;

    const club = await this.clubRepository.findById(clubId);
    ClubMembershipPolicy.assertClubExists(club);

    await this.cacheManager.set(cacheKey, club, 3600);
    return club;
  }

  private async assertActorIsClubAdmin(clubId: string, actorId: string) {
    const membership = await this.clubRepository.findMembership(actorId, clubId);
    ClubMembershipPolicy.assertMembershipRecord(membership);
    ClubMembershipPolicy.assertIsClubAdmin(membership.role === ClubRole.ADMIN);
  }

  async updateBookClub(
    clubId: string,
    actorId: string,
    name?: string,
    description?: string,
    imageFile?: { filename?: string },
  ) {
    const club = await this.clubRepository.findById(clubId);
    ClubMembershipPolicy.assertClubExists(club);
    await this.assertActorIsClubAdmin(clubId, actorId);

    if (name) club.name = name;
    if (description) club.description = description;
    if (imageFile) club.imageUrl = `/uploads/${imageFile.filename}`;

    await this.cacheManager.del(CACHE_CLUBS.CLUB(clubId));
    await this.cacheManager.del(CACHE_CLUBS.ALL_CLUBS);

    return this.clubRepository.saveClub(club);
  }

  async deleteBookClub(clubId: string, actorId: string) {
    const club = await this.clubRepository.findById(clubId);
    ClubMembershipPolicy.assertClubExists(club);
    await this.assertActorIsClubAdmin(clubId, actorId);

    await this.cacheManager.del(CACHE_CLUBS.CLUB(clubId));
    await this.cacheManager.del(CACHE_CLUBS.ALL_CLUBS);
    return this.clubRepository.deleteClubAndMembers(club);
  }

  async addMember(clubId: string, userId: string, actorId: string) {
    const club = await this.clubRepository.findById(clubId);
    ClubMembershipPolicy.assertClubExists(club);
    await this.assertActorIsClubAdmin(clubId, actorId);

    const inAny = !!(await this.clubRepository.findMembershipByUser(userId));
    ClubMembershipPolicy.assertUserNotInAnyClub(
      inAny,
      "User is already a member of another club.",
    );

    const member = await this.clubRepository.withTransaction(async (session) => {
      const created = await this.clubRepository.addMemberToClub(club, userId, session);
      await this.domainEventOutbox.enqueueClubMemberJoined(
        {
          clubId,
          clubName: club.name,
          userId,
          actorId,
        },
        session,
      );
      return created;
    });

    return member;
  }

  async isUserInClub(userId: string, clubId: string) {
    const member = await this.clubRepository.findMembership(userId, clubId);
    return !!member;
  }

  async isClubAdmin(userId: string, clubId: string) {
    const membership = await this.clubRepository.findMembership(userId, clubId);
    return membership?.role === ClubRole.ADMIN;
  }

  async isUserInAnyClub(userId: string) {
    const member = await this.clubRepository.findMembershipByUser(userId);
    return !!member;
  }

  async leaveFromClub(clubId: string, userId: string) {
    const membership = await this.clubRepository.findMembership(userId, clubId);
    ClubMembershipPolicy.assertMembershipRecord(membership);

    const club = await this.clubRepository.findById(clubId);
    ClubMembershipPolicy.assertClubExists(club);

    await this.clubRepository.withTransaction(async (session) => {
      await this.clubRepository.removeMembership(membership, club, session);
      await this.domainEventOutbox.enqueueClubMemberLeft(
        {
          clubId,
          clubName: club.name,
          userId,
          actorId: userId,
        },
        session,
      );
    });
  }

  async removeMemberFromClub(clubId: string, userId: string, actorId: string) {
    await this.assertActorIsClubAdmin(clubId, actorId);

    const isMember = await this.isUserInClub(userId, clubId);
    ClubMembershipPolicy.assertIsMember(isMember);

    const membership = await this.clubRepository.findMembership(userId, clubId);
    ClubMembershipPolicy.assertMembershipRecord(membership);

    const club = await this.clubRepository.findById(clubId);
    ClubMembershipPolicy.assertClubExists(club);

    await this.clubRepository.withTransaction(async (session) => {
      await this.clubRepository.removeMembership(membership, club, session);
      await this.domainEventOutbox.enqueueClubMemberLeft(
        {
          clubId,
          clubName: club.name,
          userId,
          actorId,
        },
        session,
      );
    });
  }
}
