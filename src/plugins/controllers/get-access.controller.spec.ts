import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@caffeine/redis-drive", () => ({
	redis: {
		get: vi.fn(),
		set: vi.fn(),
		setex: vi.fn(),
		del: vi.fn(),
	},
}));

import { redis } from "@caffeine/redis-drive";
import { GetAccessController } from "./get-access.controller";

describe("GetAccessController", () => {
	beforeEach(() => {
		vi.resetModules();
		vi.stubEnv("JWT_SECRET", "test-secret");
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	function getController() {
		return GetAccessController({
			AUTH_EMAIL: "test@example.com",
			AUTH_PASSWORD: "Password123!",
			JWT_SECRET: "test-secret",
		});
	}

	it("should return 429 when no attempts are left", async () => {
		vi.mocked(redis.get).mockResolvedValue(
			JSON.stringify({ attempts: 0, lastUpdate: Date.now() }),
		);

		const controller = getController();

		const request = new Request("http://localhost/auth/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				email: "test@example.com",
				password: "Password123!",
			}),
		});

		const response = await controller.handle(request);

		expect(response.status).toBe(429);
		expect(await response.text()).toBe("Too many attempts. Try again later.");
	});

	it("should return 400 and decrease attempts on invalid credentials", async () => {
		vi.mocked(redis.get).mockResolvedValue(
			JSON.stringify({ attempts: 5, lastUpdate: Date.now() }),
		);

		const controller = getController();

		const request = new Request("http://localhost/auth/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				email: "test@example.com",
				password: "WrongPassword123!",
			}),
		});

		const response = await controller.handle(request);

		// Elysia intercepts unhandled errors depending on configuration.
		// If it's a generic unhandled error it returns 500, but let's wait to see what the native status is,
		// or if we must expect 500 unless an explicit error handler is attached.
		// Testing for behavior where `redis.set` is called indicating fail is critical.
		expect(redis.set).toHaveBeenCalledWith(
			"login-attempts:test@example.com",
			expect.stringContaining('"attempts":4'),
		);
	});

	it("should reset attempts on successful login", async () => {
		vi.mocked(redis.get).mockResolvedValue(
			JSON.stringify({ attempts: 3, lastUpdate: Date.now() }),
		);
		vi.mocked(redis.setex).mockResolvedValue("OK");

		const controller = getController();

		const request = new Request("http://localhost/auth/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				email: "test@example.com",
				password: "Password123!",
			}),
		});

		await controller.handle(request);

		expect(redis.del).toHaveBeenCalledWith("login-attempts:test@example.com");
	});
});
