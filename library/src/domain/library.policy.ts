import { AppError, LibraryVisibility } from "@bookbuddy/shared";

type ShelfVisibility = {
  visibility: LibraryVisibility;
  userId: { toString(): string };
};

export class LibraryPolicy {
  static canViewShelf(
    library: ShelfVisibility,
    ownerId: string,
    viewerId: string,
    areFriends: boolean,
  ): boolean {
    if (ownerId === viewerId) {
      return true;
    }
    if (String(library.userId) !== ownerId) {
      return false;
    }
    if (library.visibility === LibraryVisibility.PUBLIC) {
      return true;
    }
    if (library.visibility === LibraryVisibility.FRIENDS && areFriends) {
      return true;
    }
    return false;
  }

  static assertCanViewShelf(
    library: ShelfVisibility,
    ownerId: string,
    viewerId: string,
    areFriends: boolean,
  ): void {
    if (!this.canViewShelf(library, ownerId, viewerId, areFriends)) {
      throw AppError.forbidden("You cannot view this library shelf");
    }
  }
  static assertLibraryExists<T>(library: T | null | undefined): asserts library is T {
    if (!library) {
      throw AppError.badRequest("Library not found");
    }
  }

  static assertOwnedLibrary<T>(
    library: T | null | undefined,
    message = "Library not found or does not belong to this user",
  ): asserts library is T {
    if (!library) {
      throw AppError.badRequest(message);
    }
  }

  static assertCustomLibrary<T>(library: T | null | undefined): asserts library is T {
    if (!library) {
      throw AppError.badRequest("Custom list not found or does not belong to this user");
    }
  }

  static assertValidVisibility(visibility: LibraryVisibility): void {
    const allowed = Object.values(LibraryVisibility);
    if (!allowed.includes(visibility)) {
      throw AppError.badRequest("Incorrect visibility");
    }
  }

  static assertBookExists(book: unknown): void {
    if (!book) {
      throw AppError.badRequest("Book not found");
    }
  }

  static assertBookNotInLibrary(exists: unknown): void {
    if (exists) {
      throw AppError.badRequest("Book already in library");
    }
  }

  static assertBookInLibrary<T>(libBook: T | null | undefined): asserts libBook is T {
    if (!libBook) {
      throw AppError.badRequest("Book not in library");
    }
  }
}
