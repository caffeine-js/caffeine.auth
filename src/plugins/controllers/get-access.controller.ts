import { VerifyCredentialsDTO } from "@/dtos";
import { JWT } from "@/models";
import { verifyCredentials } from "@/utils/verify-credentials";
import { UnauthorizedException } from "@caffeine/errors/application";
import { generateUUID } from "@caffeine/models/helpers";
import Elysia from "elysia";

export const GetAccessController = new Elysia()
	.decorate("jwt", new JWT("auth@login"))
	.post(
		"/auth/login",
		async ({ body, jwt }) => {
			if (!verifyCredentials(body, "auth@login"))
				throw new UnauthorizedException("auth@login");

			process.env.ACCESS_KEY = generateUUID();

			return { token: await jwt.sign({ ACCESS_KEY: process.env.ACCESS_KEY }) };
		},
		{
			body: VerifyCredentialsDTO,
			detail: {
				summary: "Authenticate user",
				tags: ["Auth"],
			},
		},
	);
