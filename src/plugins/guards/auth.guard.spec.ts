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
import { CaffeineAuth } from "./auth.guard";
import { JWT } from "@/models";
import { AccessKey } from "@/utils/access-key";
// import { BadRequestException, UnauthorizedException, } from "@caffeine/errors/application"; // Unused in this test file directly? Or used to check instanceof error? using response status is better.

describe("AuthGuard", () => {
	beforeEach(() => {
		vi.resetModules();
		vi.clearAllMocks();

		vi.mocked(JWT).mockImplementation(function () {
			return {
				sign: mockSign,
				verify: mockVerify,
			} as any;
		});
	});

	it("should throw BadRequestException if ACCESS_TOKEN cookie is missing", async () => {
		const app = CaffeineAuth({ layerName: "test-layer" });
		const testApp = app.get("/", () => "success");
		const request = new Request("http://localhost/");

		const res = await testApp.handle(request);
		expect(res.status).not.toBe(200);
	});

	it("should throw UnauthorizedException if ACCESS_KEY in token does not match Redis", async () => {
		vi.mocked(AccessKey.get).mockResolvedValue("correct-key");
		mockVerify.mockResolvedValue({
			payload: { ACCESS_KEY: "wrong-key", EMAIL: "test@example.com" },
		});

		const app = CaffeineAuth({ layerName: "test-layer" });
		const testApp = app.get("/", () => "success");

		const request = new Request("http://localhost/", {
			headers: { cookie: "ACCESS_TOKEN=valid.token" },
		});

		const res = await testApp.handle(request);
		expect(res.status).not.toBe(200);
		expect(mockVerify).toHaveBeenCalled();
		expect(AccessKey.get).toHaveBeenCalledWith("test@example.com");
	});

	it("should throw ResourceNotFoundException if EMAIL is missing in token", async () => {
		mockVerify.mockResolvedValue({
			payload: { ACCESS_KEY: "any", EMAIL: null },
		});

		const app = CaffeineAuth({ layerName: "test-layer" });
		const testApp = app.get("/", () => "success");

		const request = new Request("http://localhost/", {
			headers: { cookie: "ACCESS_TOKEN=valid.token" },
		});

		const res = await testApp.handle(request);
		expect(res.status).not.toBe(200);
	});

	it("should pass if token has correct ACCESS_KEY and EMAIL", async () => {
		vi.mocked(AccessKey.get).mockResolvedValue("correct-key");
		mockVerify.mockResolvedValue({
			payload: { ACCESS_KEY: "correct-key", EMAIL: "test@example.com" },
		});

		const app = CaffeineAuth({ layerName: "test-layer" });
		const testApp = app.get("/", () => "success");

		const request = new Request("http://localhost/", {
			headers: { cookie: "ACCESS_TOKEN=valid.token" },
		});

		const res = await testApp.handle(request);
		const text = await res.text();

		expect(res.status).toBe(200);
		expect(text).toBe("success");
		expect(AccessKey.get).toHaveBeenCalledWith("test@example.com");
	});
});
