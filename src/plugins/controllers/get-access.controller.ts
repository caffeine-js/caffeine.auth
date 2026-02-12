import { VerifyCredentialsDTO } from "@/dtos";
import { JWT } from "@/models";
import { AccessKey } from "@/utils/access-key";
import { verifyCredentials } from "@/utils/verify-credentials";
import { generateUUID } from "@caffeine/entity/helpers";
import { UnauthorizedException } from "@caffeine/errors/application";
import Elysia from "elysia";

export const GetAccessController = new Elysia()
	.decorate("jwt", new JWT("auth@login"))
	.state("accessKey", generateUUID())
	.post(
		"/auth/login",
		async ({ body, jwt }) => {
			if (!verifyCredentials(body, "auth@login"))
				throw new UnauthorizedException("auth@login");

			const accessKey = await AccessKey.set(generateUUID());

			return { token: await jwt.sign({ ACCESS_KEY: accessKey }) };
		},
		{
			body: VerifyCredentialsDTO,
			detail: {
				summary: "Authenticate user",
				tags: ["Auth"],
			},
		},
	);
