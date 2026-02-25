import type { t } from "@caffeine/models";
import { BadResponseDTO } from "@caffeine/models/dtos/api";

export const UnauthorizedExceptionDTO = structuredClone(BadResponseDTO);

UnauthorizedExceptionDTO.examples = [
	{
		layer: "application",
		name: "Unauthorized",
		message: "Unauthorized access to the {{SOURCE}} application.",
		layerName: "post@post-type",
	},
];

export type UnauthorizedExceptionDTO = t.Static<
	typeof UnauthorizedExceptionDTO
>;
