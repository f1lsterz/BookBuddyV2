import { LibraryVisibility } from "@bookbuddy/shared";
import { LibraryPolicy } from "./library.policy";

describe("LibraryPolicy", () => {
  it("assertLibraryExists throws when missing", () => {
    expect(() => LibraryPolicy.assertLibraryExists(null)).toThrow(/Library not found/);
  });

  it("assertBookNotInLibrary throws when book exists", () => {
    expect(() => LibraryPolicy.assertBookNotInLibrary({ id: "x" })).toThrow(
      /already in library/,
    );
  });

  it("assertValidVisibility accepts enum values", () => {
    expect(() =>
      LibraryPolicy.assertValidVisibility(LibraryVisibility.PUBLIC),
    ).not.toThrow();
  });

  it("assertValidVisibility rejects unknown value", () => {
    expect(() =>
      LibraryPolicy.assertValidVisibility("invalid" as LibraryVisibility),
    ).toThrow(/Incorrect visibility/);
  });

  it("canViewShelf allows owner and public", () => {
    const owner = "507f1f77bcf86cd799439011";
    const viewer = "507f1f77bcf86cd799439012";
    const shelf = {
      userId: { toString: () => owner },
      visibility: LibraryVisibility.PUBLIC,
    };
    expect(LibraryPolicy.canViewShelf(shelf, owner, viewer, false)).toBe(true);
    expect(LibraryPolicy.canViewShelf(shelf, owner, owner, false)).toBe(true);
  });

  it("canViewShelf friends only with friendship", () => {
    const owner = "507f1f77bcf86cd799439011";
    const viewer = "507f1f77bcf86cd799439012";
    const shelf = {
      userId: { toString: () => owner },
      visibility: LibraryVisibility.FRIENDS,
    };
    expect(LibraryPolicy.canViewShelf(shelf, owner, viewer, false)).toBe(false);
    expect(LibraryPolicy.canViewShelf(shelf, owner, viewer, true)).toBe(true);
  });

  it("assertBookInLibrary narrows type after success", () => {
    const doc = { _id: "1" };
    LibraryPolicy.assertBookInLibrary(doc);
    expect(doc._id).toBe("1");
  });
});
