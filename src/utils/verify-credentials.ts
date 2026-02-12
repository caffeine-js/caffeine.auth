import { VerifyCredentialsDTO } from "@/dtos";
import { BadRequestException } from "@caffeine/errors/application";
import { Schema } from "@caffeine/schema";

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
