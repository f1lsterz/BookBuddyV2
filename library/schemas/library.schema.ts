import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type LibraryDocument = HydratedDocument<Library>;

export enum LibraryStatus {
  FAVOURITE = "FAVOURITE",
  READING = "READING",
  ALREADY_READ = "ALREADY_READ",
  WANNA_READ = "WANNA_READ",
  DROPPED = "DROPPED",
  CUSTOM = "CUSTOM",
}

export enum LibraryVisibility {
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
  FRIENDS = "FRIENDS",
}

@Schema({ timestamps: true })
export class Library {
  @Prop({ required: true, enum: LibraryStatus })
  status: LibraryStatus;

  @Prop({ required: true, enum: LibraryVisibility })
  visibility: LibraryVisibility;

  @Prop()
  customName?: string;

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  userId: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: "LibraryBook" }], default: [] })
  books: Types.ObjectId[];
}

export const LibrarySchema = SchemaFactory.createForClass(Library);
export type LibraryBookDocument = HydratedDocument<LibraryBook>;

@Schema({ timestamps: true })
export class LibraryBook {
  @Prop({ type: Types.ObjectId, ref: "Library", required: true })
  libraryId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  bookId: Types.ObjectId;
}

export const LibraryBookSchema = SchemaFactory.createForClass(LibraryBook);
LibraryBookSchema.index({ libraryId: 1, bookId: 1 }, { unique: true });
