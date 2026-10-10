import { SetMetadata } from "@nestjs/common";

export const NO_TIMEOUT_KEY = "no-timeout";
export const NoTimeout = () => SetMetadata(NO_TIMEOUT_KEY, true);
