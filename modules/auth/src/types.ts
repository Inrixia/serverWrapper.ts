export type AssigningUser = {
	name: string;
	id: string;
};
export type AllowedCommand = {
	assignedAt: number;
	assignedBy: AssigningUser;
	expiresAt?: number;
};
export type AllowedCommands = Record<string, AllowedCommand>;
export type ModuleSettings = {
	minecraft: Record<
		string,
		{
			username: string;
			allowedCommands: AllowedCommands;
		}
	>;
	discord: Record<
		string,
		{
			name: string;
			allowedCommands: AllowedCommands;
		}
	>;
};
