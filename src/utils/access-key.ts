import type { CaffeineCacheInstance } from "@caffeine/cache";
import { CACHE_EXPIRATION_TIME } from "@caffeine/constants";
import { DatabaseUnavailableException } from "@caffeine/errors/infra";

export class AccessKey {
    constructor(private readonly cache: CaffeineCacheInstance) {}

    async get(email: string): Promise<string | null> {
        return await this.cache.get(`access-key:${email}`);
    }

    async set(email: string, value: string): Promise<string> {
        try {
            await this.cache.setex(
                `access-key:${email}`,
                CACHE_EXPIRATION_TIME.SAFE,
                value,
            );

            return value;
        } catch (_) {
            throw new DatabaseUnavailableException(
                "auth@login",
                "Redis is Unavailable",
            );
        }
    }
}
