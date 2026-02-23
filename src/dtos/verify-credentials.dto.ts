import { t } from "@caffeine/models";

export const VerifyCredentialsDTO = t.Object(
	{
		email: t.String({
			description: "The user's email address.",
		}),
		password: t.String(),
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
