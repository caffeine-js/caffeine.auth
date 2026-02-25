import { jwtVerify, SignJWT, type JWTPayload } from "jose";
import {
	UnableToSignPayloadException,
	InvalidJWTException,
} from "@caffeine/errors/application/jwt";

export class JWT {
	private readonly secret: Uint8Array;

	constructor(
		private readonly layerName: string,
		secret: string,
	) {
		this.secret = new TextEncoder().encode(secret);
	}

	async sign(content: JWTPayload) {
		try {
			return await new SignJWT(content)
				.setProtectedHeader({ alg: "HS256" })
				.setIssuedAt()
				.setExpirationTime("1h")
				.sign(this.secret);
		} catch (_) {
			throw new UnableToSignPayloadException(this.layerName);
		}
	}

	async verify<Output>(token: string) {
		try {
			return await jwtVerify<Output>(token, this.secret);
		} catch (_) {
			throw new InvalidJWTException(this.layerName);
		}
	}
}
