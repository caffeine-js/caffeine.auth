import { JWT } from "@/models";
import {
	UnauthorizedException,
	ResourceNotFoundException,
} from "@caffeine/errors/application";
import Elysia from "elysia";
import type { IAuthOptions } from "./types/auth-options.interface";
import { AccessKey } from "@/utils/access-key";
import {
	BadRequestExceptionDTO,
	ResourceNotFoundExceptionDTO,
	UnauthorizedExceptionDTO,
} from "@/dtos/errors";
import { AuthorizationDTO } from "@caffeine/models/dtos/api";

export const CaffeineAuth = ({ layerName, jwtSecret }: IAuthOptions) => {
	return new Elysia()
		.derive({ as: "local" }, () => ({
			authJwt: new JWT(layerName, jwtSecret),
		}))
		.guard({
			as: "scoped",
			headers: AuthorizationDTO,
			response: {
				400: BadRequestExceptionDTO,
				401: UnauthorizedExceptionDTO,
				404: ResourceNotFoundExceptionDTO,
			},
		})
		.onBeforeHandle(async ({ cookie: { ACCESS_TOKEN }, authJwt }) => {
			if (!ACCESS_TOKEN || typeof ACCESS_TOKEN.value !== "string")
				throw new UnauthorizedException(layerName);

			const value = String(ACCESS_TOKEN.value);

			const {
				payload: { ACCESS_KEY, EMAIL },
			} = await authJwt.verify<{
				ACCESS_KEY: string | null;
				EMAIL: string | null;
			}>(value);

			if (!EMAIL)
				throw new ResourceNotFoundException(layerName, `EMAIL was missing`);

			const currentAccessKey = await AccessKey.get(EMAIL);

			if (!ACCESS_KEY || ACCESS_KEY !== currentAccessKey)
				throw new UnauthorizedException(layerName);
		});
};
