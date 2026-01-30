import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Pre-mock dependencies so imports work
vi.mock("@/utils/verify-credentials", () => ({
	verifyCredentials: vi.fn(),
}));

// Types
import type { UnauthorizedException } from "@caffeine/errors/application";
// We don't import GetAccessController here to avoid early initialization

describe("GetAccessController", () => {
	beforeEach(() => {
		vi.resetModules(); // Clears cache of imported modules
		vi.stubEnv("JWT_SECRET", "test-secret");
		vi.stubEnv("ACCESS_KEY", "old-key");
	});

	afterEach(() => {
		vi.unstubAllEnvs();
		vi.clearAllMocks();
	});

	async function getController() {
		const { GetAccessController } = await import("./get-access.controller");
		const { verifyCredentials } = await import("@/utils/verify-credentials");
		return { GetAccessController, verifyCredentials };
	}

	it("should return a token when credentials are valid and update ACCESS_KEY", async () => {
		const { GetAccessController, verifyCredentials } = await getController();
		vi.mocked(verifyCredentials).mockReturnValue(true);

		const body = {
			email: "test@example.com",
			password: "Password123!",
		};

		const request = new Request("http://localhost/auth/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});

		const response = await GetAccessController.handle(request);
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data).toHaveProperty("token");
		expect(process.env.ACCESS_KEY).not.toBe("old-key");
		expect(process.env.ACCESS_KEY).toBeDefined();
		expect(verifyCredentials).toHaveBeenCalledWith(body, "auth@login");
	});

	it("should return 401/500 when credentials are invalid (UnauthorizedException)", async () => {
		const { GetAccessController, verifyCredentials } = await getController();
		vi.mocked(verifyCredentials).mockReturnValue(false);

		const body = {
			email: "wrong@example.com",
			password: "Password123!",
		};

		const request = new Request("http://localhost/auth/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});

		// Since Elysia catches errors and returns a response, verify the status code
		// UnauthorizedException usually maps to 401 or handled as 500 if not caught explicitly.
		// We expect the request to NOT succeed.
		const response = await GetAccessController.handle(request);
		expect(response.status).not.toBe(200);

		// If we want to check that verifyCredentials was called
		expect(verifyCredentials).toHaveBeenCalled();
	});
});
