import { ChatService } from "./chat.service";
import { ClubRpcClient } from "./infrastructure/club-rpc.client";
import { Model } from "mongoose";
import { ChatMessageDocument } from "schemas/message.schema";

describe("ChatService", () => {
  let service: ChatService;
  let clubRpc: jest.Mocked<Pick<ClubRpcClient, "isUserInClub">>;
  let saveMock: jest.Mock;

  beforeEach(() => {
    clubRpc = { isUserInClub: jest.fn() };
    saveMock = jest.fn().mockResolvedValue({ _id: "msg1", message: "hi" });

    const model = jest.fn().mockImplementation(() => ({
      save: saveMock,
    })) as unknown as Model<ChatMessageDocument>;

    service = new ChatService(model, clubRpc as unknown as ClubRpcClient);
  });

  it("sendMessage rejects non-members", async () => {
    clubRpc.isUserInClub.mockResolvedValue(false);

    await expect(
      service.sendMessage({
        clubId: "507f1f77bcf86cd799439011",
        userId: "507f1f77bcf86cd799439012",
        message: "Hello",
      }),
    ).rejects.toThrow(/club member/);

    expect(saveMock).not.toHaveBeenCalled();
  });

  it("sendMessage persists for club members", async () => {
    clubRpc.isUserInClub.mockResolvedValue(true);

    await service.sendMessage({
      clubId: "507f1f77bcf86cd799439011",
      userId: "507f1f77bcf86cd799439012",
      message: "Hello",
    });

    expect(saveMock).toHaveBeenCalled();
  });
});
