import { CACHE_EXPIRATION_TIME } from "@caffeine/constants";
import { redis } from "@caffeine/redis-drive";

export const AccessKey = {
	get: async (email: string): Promise<string | null> => {
		return await redis.get(`access-key:${email}`);
	},

	set: async (email: string, value: string): Promise<string> => {
		await redis.setex(`access-key:${email}`, CACHE_EXPIRATION_TIME.SAFE, value);

		return value;
	},
};
