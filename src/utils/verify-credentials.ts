import { VerifyCredentialsDTO } from "@/dtos";
import { BadRequestException } from "@caffeine/errors/application";
import { Schema } from "@caffeine/schema";

export function verifyCredentials(
	data: VerifyCredentialsDTO,
	layerName: string,
	auth: VerifyCredentialsDTO,
): boolean {
	if (!Schema.make(VerifyCredentialsDTO).match(data))
		throw new BadRequestException(layerName);

	const { email, password } = data;

	return email === auth.email && password === auth.password;
}
