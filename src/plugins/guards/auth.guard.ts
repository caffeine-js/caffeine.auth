import { JWT } from "@/models";
import {
	BadRequestException,
	UnauthorizedException,
} from "@caffeine/errors/application";
import bearer from "@elysiajs/bearer";
import Elysia from "elysia";
import type { IAuthOptions } from "./types/auth-options.interface";
import { AuthorizationDTO } from "@caffeine/models/dtos/api";
import { AccessKey } from "@/utils/access-key";

export const AuthGuard = (options: IAuthOptions) => {
	return new Elysia()
		.use(bearer())
		.guard({
			as: "scoped",
			headers: AuthorizationDTO,
		})
		.decorate("jwt", new JWT(options.layerName))
		.onBeforeHandle(async ({ bearer, jwt }) => {
			if (!bearer) throw new BadRequestException(options.layerName);

			const {
				payload: { ACCESS_KEY },
			} = await jwt.verify<{ ACCESS_KEY: string | null }>(bearer);

			const currentAccessKey = await AccessKey.get();

			if (!ACCESS_KEY || ACCESS_KEY !== currentAccessKey)
				throw new UnauthorizedException(options.layerName);
		});
};
