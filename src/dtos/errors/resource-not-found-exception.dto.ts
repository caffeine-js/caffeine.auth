import type { t } from "@caffeine/models";
import { BadResponseDTO } from "@caffeine/models/dtos/api";

export const ResourceNotFoundExceptionDTO = structuredClone(BadResponseDTO);

ResourceNotFoundExceptionDTO.examples = [
	{
		layer: "application",
		name: "Resource Not Found",
		message: "Resource not found in the {{SOURCE}} application.",
		layerName: "post@post-type",
	},
];

export type ResourceNotFoundExceptionDTO = t.Static<
	typeof ResourceNotFoundExceptionDTO
>;
