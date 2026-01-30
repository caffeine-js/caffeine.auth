import { VerifyCredentialsDTO } from "@/dtos";
import { Schema } from "@caffeine/models";
import { BadRequestException } from "@caffeine/errors/application";

export function verifyCredentials(
	data: VerifyCredentialsDTO,
	layerName: string,
): boolean {
	if (!Schema.make(VerifyCredentialsDTO).match(data))
		throw new BadRequestException(layerName);

	const { email, password } = data;

	return (
		email === process.env.AUTH_EMAIL && password === process.env.AUTH_PASSWORD
	);
}
