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
import { CaffeineCache } from "@caffeine/cache";

export const CaffeineAuth = ({
    layerName,
    jwtSecret,
    cacheProvider,
    redisUrl,
}: IAuthOptions) => {
    return new Elysia()
        .use(
            CaffeineCache({
                REDIS_URL: redisUrl,
                CACHE_PROVIDER: cacheProvider,
            }),
        )
        .use((app) => {
            const { cache } = app.decorator;
            return app.decorate("authAccessKey", new AccessKey(cache));
        })
        .derive({ as: "scoped" }, () => ({
            authJwt: new JWT(layerName, jwtSecret),
        }))
        .guard({
            as: "scoped",
            response: {
                400: BadRequestExceptionDTO,
                401: UnauthorizedExceptionDTO,
                404: ResourceNotFoundExceptionDTO,
            },
        })
        .onBeforeHandle(
            { as: "scoped" },
            async ({ cookie: { ACCESS_TOKEN }, authJwt, authAccessKey }) => {
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
                    throw new ResourceNotFoundException(
                        layerName,
                        `EMAIL was missing`,
                    );

                const currentAccessKey = await authAccessKey.get(EMAIL);

                if (!ACCESS_KEY || ACCESS_KEY !== currentAccessKey)
                    throw new UnauthorizedException(layerName);
            },
        );
};
