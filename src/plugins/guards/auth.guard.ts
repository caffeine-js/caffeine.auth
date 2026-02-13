import { JWT } from "@/models";
import {
	BadRequestException,
	UnauthorizedException,
	ResourceNotFoundException,
} from "@caffeine/errors/application";
import Elysia from "elysia";
import type { IAuthOptions } from "./types/auth-options.interface";
import { AccessKey } from "@/utils/access-key";
import { t } from "@caffeine/models";

export const AuthGuard = (options: IAuthOptions) => {
	return new Elysia()
		.guard({
			as: "scoped",
			response: {
				400: t.String(),
			},
		})
		.decorate("jwt", new JWT(options.layerName))
		.onBeforeHandle(async ({ cookie: { ACCESS_TOKEN }, jwt }) => {
			if (!ACCESS_TOKEN || typeof ACCESS_TOKEN.value !== "string")
				throw new BadRequestException(options.layerName);

			const value = String(ACCESS_TOKEN.value);

			const {
				payload: { ACCESS_KEY, EMAIL },
			} = await jwt.verify<{ ACCESS_KEY: string | null; EMAIL: string | null }>(
				value,
			);

			if (!EMAIL)
				throw new ResourceNotFoundException(
					options.layerName,
					`EMAIL was missing`,
				);

			const currentAccessKey = await AccessKey.get(EMAIL);

			if (!ACCESS_KEY || ACCESS_KEY !== currentAccessKey)
				throw new UnauthorizedException(options.layerName);
		});
};
