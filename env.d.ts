declare namespace NodeJS {
	export interface ProcessEnv {
		AUTH_EMAIL: string;
		AUTH_PASSWORD: string;
		ACCESS_KEY: string;
		JWT_SECRET: string;
	}
}
