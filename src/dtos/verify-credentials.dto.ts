import { t } from "@caffeine/models";
import { PasswordDTO } from "@caffeine/models/dtos";
import { EmailDTO } from "@caffeine/models/dtos/primitives";

export const VerifyCredentialsDTO = t.Object(
	{
		email: EmailDTO,
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
