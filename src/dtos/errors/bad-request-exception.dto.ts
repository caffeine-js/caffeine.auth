import type { t } from "@caffeine/models";
import { BadResponseDTO } from "@caffeine/models/dtos/api";

export const BadRequestExceptionDTO = structuredClone(BadResponseDTO);

BadRequestExceptionDTO.examples = [
	{
		layer: "application",
		name: "Bad Request",
		message: "Bad request for the {{SOURCE}} application.",
		layerName: "post@post-type",
	},
];

export type BadRequestExceptionDTO = t.Static<typeof BadRequestExceptionDTO>;
