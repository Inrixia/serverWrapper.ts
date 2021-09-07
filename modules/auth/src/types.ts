export type AssigningUser = {
	Username: string;
	discordId?: string;
};
export type AllowedCommands = Record<
	string,
	{
		assignedAt: number;
		assignedBy: AssigningUser;
		expiresAt: number;
	}
>;
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
