import { redis } from "@caffeine/redis-drive";

const MAX_ATTEMPTS = 5;
const RECOVERY_TIME_PER_ATTEMPT = 60 * 60 * 1000;

export const LoginAttempt = {
	check: async (email: string): Promise<number> => {
		const key = `login-attempts:${email}`;
		const data = await redis.get(key);

		if (!data) return MAX_ATTEMPTS;

		const { attempts, lastUpdate } = JSON.parse(data) as {
			attempts: number;
			lastUpdate: number;
		};

		const now = Date.now();
		const elapsed = now - lastUpdate;
		const recovered = Math.floor(elapsed / RECOVERY_TIME_PER_ATTEMPT);

		const currentAttempts = Math.min(MAX_ATTEMPTS, attempts + recovered);

		return currentAttempts;
	},

	fail: async (email: string, currentAttempts: number): Promise<number> => {
		const key = `login-attempts:${email}`;
		const nextAttempts = Math.max(0, currentAttempts - 1);

		await redis.set(
			key,
			JSON.stringify({
				attempts: nextAttempts,
				lastUpdate: Date.now(),
			}),
		);

		return nextAttempts;
	},

	success: async (email: string): Promise<void> => {
		const key = `login-attempts:${email}`;
		await redis.del(key);
	},
};
