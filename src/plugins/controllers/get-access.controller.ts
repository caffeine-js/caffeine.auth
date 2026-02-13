import { VerifyCredentialsDTO } from "@/dtos";
import { JWT } from "@/models";
import { AccessKey, LoginAttempt, verifyCredentials } from "@/utils";
import { generateUUID } from "@caffeine/entity/helpers";
import Elysia from "elysia";

const status = {
	1: "🤯",
	2: "😡",
	3: "🫠",
	4: "😃",
	5: "😎",
} as const;

export const GetAccessController = new Elysia()
	.decorate("jwt", new JWT("auth@login"))
	.post(
		"/auth/login",
		async ({ body, jwt, cookie: { ACCESS_TOKEN }, set }) => {
			const attempts = (await LoginAttempt.check(
				body.email,
			)) as keyof typeof status;

			if (attempts <= 0) {
				console.log(
					`[💀] Access blocked for ${body.email}. No attempts remaining.`,
				);
				set.status = 429;
				return "Too many attempts. Try again later.";
			}

			console.log(
				`[${status[attempts]}] Attempts remaining for ${body.email}: ${attempts}`,
			);

			const entryIsValid = verifyCredentials(body, "auth@login");

			if (entryIsValid) {
				await LoginAttempt.success(body.email);
			} else {
				const remaining = await LoginAttempt.fail(body.email, attempts);
				console.log(
					`[🔒] Login failed for ${body.email}. ${remaining} attempts remaining.`,
				);
			}

			// Eu te amaldiçoei ehheheheje
			const oldAccessKey = (await AccessKey.get(body.email)) ?? "hehe";
			const accessKey = await AccessKey.set(body.email, generateUUID());

			ACCESS_TOKEN!.value = await jwt.sign({
				ACCESS_KEY: entryIsValid ? accessKey : oldAccessKey,
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
			},
		},
	);
