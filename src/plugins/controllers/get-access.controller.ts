import { AuthEnvDependenciesDTO, VerifyCredentialsDTO } from "@/dtos";
import {
	BadRequestExceptionDTO,
	DatabaseUnavailableExceptionDTO,
} from "@/dtos/errors";
import { JWT } from "@/models";
import { AccessKey, LoginAttempt, verifyCredentials } from "@/utils";
import { generateUUID } from "@caffeine/entity/helpers";
import { BadRequestException } from "@caffeine/errors/application";
import { MissingPluginDependencyException } from "@caffeine/errors/infra";
import { t } from "@caffeine/models";
import { Schema } from "@caffeine/schema";
import Elysia from "elysia";

export function GetAccessController(data: AuthEnvDependenciesDTO) {
	if (!Schema.make(AuthEnvDependenciesDTO).match(data))
		throw new MissingPluginDependencyException("auth@login");

	const { AUTH_EMAIL, AUTH_PASSWORD, JWT_SECRET } = data;

	return new Elysia().decorate("jwt", new JWT("auth@login", JWT_SECRET)).post(
		"/auth/login",
		async ({ body, jwt, cookie: { ACCESS_TOKEN }, set }) => {
			const attempts = await LoginAttempt.check(body.email);

			if (attempts <= 0) {
				set.status = 429;
				return "Too many attempts. Try again later.";
			}

			const entryIsValid = verifyCredentials(body, "auth@login", {
				email: AUTH_EMAIL,
				password: AUTH_PASSWORD,
			});

			if (entryIsValid) {
				await LoginAttempt.success(body.email);
			} else {
				await LoginAttempt.fail(body.email, attempts);

				throw new BadRequestException("auth@login");
			}

			const accessKey = await AccessKey.set(body.email, generateUUID());

			ACCESS_TOKEN!.value = await jwt.sign({
				ACCESS_KEY: accessKey,
				EMAIL: body.email,
			});
			ACCESS_TOKEN!.httpOnly = true;
			ACCESS_TOKEN!.secure = true;
			ACCESS_TOKEN!.maxAge = 60 * 60;
			ACCESS_TOKEN!.path = "/";
		},
		{
			body: VerifyCredentialsDTO,
			detail: {
				summary: "Authenticate user",
				tags: ["Auth"],
				description:
					"Authenticates the user and generates a unique session access key stored in a secure cookie. Features rate limiting with progressive recovery and protection against account enumeration.",
			},
			response: {
				200: t.Undefined(),
				400: BadRequestExceptionDTO,
				429: t.String({ examples: "Too many attempts. Try again later." }),
				503: DatabaseUnavailableExceptionDTO,
			},
		},
	);
}
