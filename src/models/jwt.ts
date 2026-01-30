import { jwtVerify, SignJWT, type JWTPayload } from "jose";
import {
	UnableToSignPayloadException,
	InvalidJWTException,
} from "@caffeine/errors/application/jwt";

export class JWT {
	private readonly secret = new TextEncoder().encode(process.env.JWT_SECRET);

	constructor(private readonly layerName: string) {}

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
