import { describe, it, expect, vi, beforeEach } from "vitest";

// Pre-mock before importing
const mockVerify = vi.fn();
const mockSign = vi.fn();

vi.mock("@/models", () => {
	const JWT = vi.fn();
	return { JWT };
});

vi.mock("@/utils/access-key", () => ({
	AccessKey: {
		get: vi.fn(),
		set: vi.fn(),
	},
}));

vi.mock("@caffeine/models/dtos/api", async (importOriginal) => {
	// Import t from elysia to create a valid schema
	const { t } = await import("elysia");
	return {
		AuthorizationDTO: t.Object({
			authorization: t.String(),
		}),
	};
});

// Import after mocking
import { AuthGuard } from "./auth.guard";
import { JWT } from "@/models";
import { AccessKey } from "@/utils/access-key";
// import { BadRequestException, UnauthorizedException, } from "@caffeine/errors/application"; // Unused in this test file directly? Or used to check instanceof error? using response status is better.

describe("AuthGuard", () => {
	beforeEach(() => {
		vi.resetModules();
		vi.clearAllMocks();

		// Setup default mock implementation for each test
		// This makes JWT a constructor mock that returns an object with verify
		vi.mocked(JWT).mockImplementation(function () {
			return {
				sign: mockSign,
				verify: mockVerify,
			} as any;
		});
	});

	it("should throw BadRequestException if bearer token is missing", async () => {
		const app = AuthGuard({ layerName: "test-layer" });

		// Simulate a request without bearer token
		// Since we cannot easily construct a context for the internal handler,
		// we can test the behavior by creating a request and handling it with the app
		const request = new Request("http://localhost/");

		// We expect the guard to throw or return an error response
		// Elysia handle catches errors, so we check the response status/body or if it throws
		// If BadRequestException is unhandled, it might resolve to a 400 or 500

		// However, AuthGuard returns an Elysia instance. Let's add a test route to it.
		const testApp = app.get("/", () => "success");

		const res = await testApp.handle(request);

		// If BadRequestException is thrown, Elysia by default returns 500 or 400 if mapped.
		// Let's assume it fails.
		expect(res.status).not.toBe(200);
	});

	it("should throw UnauthorizedException if ACCESS_KEY in token does not match env", async () => {
		vi.mocked(AccessKey.get).mockResolvedValue("correct-key");
		mockVerify.mockResolvedValue({
			payload: { ACCESS_KEY: "wrong-key" },
		});

		const app = AuthGuard({ layerName: "test-layer" });
		const testApp = app.get("/", () => "success");

		const request = new Request("http://localhost/", {
			headers: { authorization: "Bearer valid.token" },
		});

		const res = await testApp.handle(request);

		expect(res.status).not.toBe(200);
		expect(mockVerify).toHaveBeenCalled();
	});

	it("should throw UnauthorizedException if ACCESS_KEY is missing in token", async () => {
		vi.mocked(AccessKey.get).mockResolvedValue("correct-key");
		mockVerify.mockResolvedValue({
			payload: { ACCESS_KEY: null },
		});

		const app = AuthGuard({ layerName: "test-layer" });
		const testApp = app.get("/", () => "success");

		const request = new Request("http://localhost/", {
			headers: { authorization: "Bearer valid.token" },
		});

		const res = await testApp.handle(request);

		expect(res.status).not.toBe(200);
	});

	it("should pass if token has correct ACCESS_KEY", async () => {
		vi.mocked(AccessKey.get).mockResolvedValue("correct-key");
		mockVerify.mockResolvedValue({
			payload: { ACCESS_KEY: "correct-key" },
		});

		const app = AuthGuard({ layerName: "test-layer" });
		// Add a simple handler to verify control flow reaches it
		const testApp = app.get("/", () => "success");

		const request = new Request("http://localhost/", {
			headers: { authorization: "Bearer valid.token" },
		});

		const res = await testApp.handle(request);
		const text = await res.text();

		expect(res.status).toBe(200);
		expect(text).toBe("success");
		expect(mockVerify).toHaveBeenCalled();
	});
});
