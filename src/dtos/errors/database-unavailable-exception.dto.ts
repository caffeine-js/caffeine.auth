import type { t } from "@caffeine/models";
import { BadResponseDTO } from "@caffeine/models/dtos/api";

export const DatabaseUnavailableExceptionDTO = structuredClone(BadResponseDTO);

DatabaseUnavailableExceptionDTO.examples = [
	{
		layer: "infra",
		name: "Database Unavailable Exceptione",
		message: "Redis is Unavailable",
		layerName: "auth@login",
	},
];

export type DatabaseUnavailableExceptionDTO = t.Static<
	typeof DatabaseUnavailableExceptionDTO
>;
