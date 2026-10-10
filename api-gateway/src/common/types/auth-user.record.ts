/** User shape from auth service after Google validation / token flows. */
export type AuthUserRecord = {
  _id: { toString(): string };
  email: string;
  role: string;
  name?: string;
  photoUrl?: string;
};
