import { MAX_ITEMS_PER_QUERY } from "@caffeine/constants";
import { redis } from "@caffeine/redis-drive";

export const AccessKey = {
	get: async (): Promise<string | null> => {
		return await redis.get("access-key");
	},

	set: async (value: string): Promise<string> => {
		await redis.setex("access-key", MAX_ITEMS_PER_QUERY, value);

		return value;
	},
};
