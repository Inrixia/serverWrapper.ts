export type AssigningUser = {
	Username: string;
	discordId?: string;
};
export type AllowedCommand = {
	assignedAt: number;
	assignedBy: AssigningUser;
	expiresAt: number;
};
export type AllowedCommands = Record<string, AllowedCommand>;
export type ModuleSettings = {
	discord: {
		roles: Record<
			string,
			{
				name: string;
				allowedCommands: AllowedCommands;
			}
		>;
		users: Record<
			string,
			{
				username: string;
				allowedCommands: AllowedCommands;
				allowAllCommands: false;
			}
		>;
	};
};
