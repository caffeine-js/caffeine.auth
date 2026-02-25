import { t } from "@caffeine/models";
import { PasswordDTO } from "@caffeine/models/dtos";
import { EmailDTO } from "@caffeine/models/dtos/primitives";

export const AuthEnvDependenciesDTO = t.Object(
	{
		JWT_SECRET: t.String({
			description:
				"Secret key used to sign and validate the authenticity of JWT tokens.",
			examples: ["super_secret_jwt_key_example"],
		}),
		AUTH_EMAIL: EmailDTO,
		AUTH_PASSWORD: PasswordDTO,
	},
	{
		description:
			"Validation schema for the authentication environment variables.",
		examples: [
			{
				JWT_SECRET: "super_secret_jwt_key_example",
				AUTH_EMAIL: "admin@caffeine.com",
				AUTH_PASSWORD: "secure_password123",
			},
		],
	},
);

export type AuthEnvDependenciesDTO = t.Static<typeof AuthEnvDependenciesDTO>;
