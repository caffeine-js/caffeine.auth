import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Pre-mock dependencies so imports work
vi.mock("@/utils", () => ({
	verifyCredentials: vi.fn(),
	AccessKey: {
		set: vi.fn().mockImplementation(async (val) => val),
		get: vi.fn(),
	},
	LoginAttempt: {
		check: vi.fn(),
		fail: vi.fn(),
		success: vi.fn(),
	},
}));

// Types
import type { UnauthorizedException } from "@caffeine/errors/application";

describe("GetAccessController", () => {
	beforeEach(() => {
		vi.resetModules();
		vi.stubEnv("JWT_SECRET", "test-secret");
	});

	afterEach(() => {
		vi.unstubAllEnvs();
		vi.clearAllMocks();
	});

	async function getController() {
		const { GetAccessController } = await import("./get-access.controller");
		const { verifyCredentials, AccessKey, LoginAttempt } = await import(
			"@/utils"
		);
		return { GetAccessController, verifyCredentials, AccessKey, LoginAttempt };
	}

	it("should return 429 when no attempts are left", async () => {
		const { GetAccessController, LoginAttempt } = await getController();
		vi.mocked(LoginAttempt.check).mockResolvedValue(0);

		const request = new Request("http://localhost/auth/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				email: "test@example.com",
				password: "Password123!",
			}),
		});

		const response = await GetAccessController.handle(request);

		expect(response.status).toBe(429);
		expect(await response.text()).toBe("Too many attempts. Try again later.");
	});

	it("should return 200 (the curse) and decrease attempts on invalid credentials", async () => {
		const { GetAccessController, verifyCredentials, LoginAttempt, AccessKey } =
			await getController();
		vi.mocked(LoginAttempt.check).mockResolvedValue(5);
		vi.mocked(verifyCredentials).mockReturnValue(false);
		vi.mocked(LoginAttempt.fail).mockResolvedValue(4);

		const request = new Request("http://localhost/auth/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				email: "test@example.com",
				password: "Password123!",
			}),
		});

		const response = await GetAccessController.handle(request);

		// Status 200 because of the "curse" logic: it always returns a token (fake or real)
		expect(response.status).toBe(200);
		expect(LoginAttempt.fail).toHaveBeenCalledWith("test@example.com", 5);
		expect(AccessKey.set).toHaveBeenCalledWith(
			"test@example.com",
			expect.any(String),
		);
	});

	it("should reset attempts on successful login", async () => {
		const { GetAccessController, verifyCredentials, LoginAttempt } =
			await getController();
		vi.mocked(LoginAttempt.check).mockResolvedValue(3);
		vi.mocked(verifyCredentials).mockReturnValue(true);

		const request = new Request("http://localhost/auth/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				email: "test@example.com",
				password: "Password123!",
			}),
		});

		await GetAccessController.handle(request);

		expect(LoginAttempt.success).toHaveBeenCalledWith("test@example.com");
	});
});
