import { LibraryVisibility } from "@bookbuddy/shared";
import { LibraryStatus } from "../../schemas/library.schema";
import { LibraryApplicationService } from "./library.application.service";
import { LibraryRepository } from "../infrastructure/library.repository";
import { BookCatalogClient } from "../infrastructure/book-catalog.client";
import { UserRpcClient } from "../infrastructure/user-rpc.client";
import { Cache } from "cache-manager";

describe("LibraryApplicationService", () => {
  const ownerId = "507f1f77bcf86cd799439011";
  const viewerId = "507f1f77bcf86cd799439012";

  let service: LibraryApplicationService;
  let libraryRepository: jest.Mocked<
    Pick<LibraryRepository, "findAllByUserId" | "findOwnedByUser">
  >;
  let userRpc: jest.Mocked<Pick<UserRpcClient, "areFriends">>;
  let cache: jest.Mocked<Pick<Cache, "get" | "set" | "del">>;

  beforeEach(() => {
    libraryRepository = {
      findAllByUserId: jest.fn(),
      findOwnedByUser: jest.fn(),
    };
    userRpc = { areFriends: jest.fn() };
    cache = {
      get: jest.fn().mockResolvedValue(undefined),
      set: jest.fn().mockResolvedValue(undefined),
      del: jest.fn().mockResolvedValue(undefined),
    };

    service = new LibraryApplicationService(
      cache as unknown as Cache,
      libraryRepository as unknown as LibraryRepository,
      { getBookById: jest.fn() } as unknown as BookCatalogClient,
      userRpc as unknown as UserRpcClient,
    );
  });

  it("listVisibleShelves returns all shelves for owner", async () => {
    const shelves = [{ visibility: LibraryVisibility.PRIVATE }];
    libraryRepository.findAllByUserId.mockResolvedValue(shelves as never);

    const result = await service.listVisibleShelves(ownerId, ownerId);

    expect(result).toEqual(shelves);
    expect(userRpc.areFriends).not.toHaveBeenCalled();
  });

  it("listVisibleShelves filters FRIENDS shelves for non-friends", async () => {
    libraryRepository.findAllByUserId.mockResolvedValue([
      {
        visibility: LibraryVisibility.PUBLIC,
        userId: ownerId,
        status: LibraryStatus.CUSTOM,
      },
      {
        visibility: LibraryVisibility.FRIENDS,
        userId: ownerId,
        status: LibraryStatus.CUSTOM,
      },
      {
        visibility: LibraryVisibility.PRIVATE,
        userId: ownerId,
        status: LibraryStatus.CUSTOM,
      },
    ] as never);
    userRpc.areFriends.mockResolvedValue(false);

    const result = await service.listVisibleShelves(ownerId, viewerId);

    expect(result).toHaveLength(1);
    expect(result[0].visibility).toBe(LibraryVisibility.PUBLIC);
  });
});
