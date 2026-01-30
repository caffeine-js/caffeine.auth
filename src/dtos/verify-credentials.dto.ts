import { t } from "@caffeine/models";
import { PasswordDTO } from "@caffeine/models/dtos";

export const VerifyCredentialsDTO = t.Object(
	{
		email: t.String({
			format: "email",
			description: "The user's email address.",
		}),
		password: PasswordDTO,
	},
	{
		description: "Data required to verify user credentials.",
		examples: [
			{
				email: "john.doe@example.com",
				password: "Password123!",
			},
		],
	},
);

export type VerifyCredentialsDTO = t.Static<typeof VerifyCredentialsDTO>;
