import { Parent, ParentThread } from "@inrixia/threads";
import chalk from "chalk";

// Import Types
import type { RequiredModuleExports } from "@spookelton/wrapperHelpers/types";
import type { WrapperModuleConfig } from "./types";

/*
/ Module class definition
*/
export default class WrapperModule {
	public readonly config: WrapperModuleConfig;
	public readonly module: string;
	private crashCount: number;
	thread: ParentThread<RequiredModuleExports, WrapperModuleConfig> | null;

	public static readonly loadedModules: Record<string, WrapperModule> = {};

	static loadModules = (modules: Record<string, WrapperModuleConfig>) =>
		Promise.all(Object.entries(modules).map(([name, config]) => new WrapperModule(name, config).start()));

	constructor(module: string, moduleSetings: WrapperModuleConfig) {
		this.config = moduleSetings;
		this.module = module;
		this.crashCount = 0;
		this.thread = null;
		WrapperModule.loadedModules[module] = this;
	}

	get running(): boolean {
		return this.thread !== null;
	}

	async onCrashed(error: Error): Promise<void> {
		this.crashCount += 1;
		setTimeout(() => this.crashCount--, 5000);
		if (this.running) {
			await this.terminate();
			this.thread = null;
		}

		if (this.crashCount < 3) {
			process.stdout.write(chalk`{red Module Crashed}: {${this.config.color}${this.module}} Restarting!\n`);
			await this.restart();
		} else {
			if (this.config.persistent === true)
				process.stdout.write(chalk`{red Module Crashed Repeatedly}: {${this.config.color}${this.module}} Unable to disable as module is persistant!\n`);
			else {
				process.stdout.write(chalk`{red Module Crashed Repeatedly}: {${this.config.color}${this.module}} Disabling!\n`);
				if (this.running) this.kill();
			}
		}
		console.log(error);
	}

	async restart(): Promise<void> {
		if (!this.config.enabled) return;
		await this.kill(true);
		await this.start();
	}

	async start(): Promise<void> {
		if (!this.config.enabled || this.running) return;
		const startTime = Date.now();
		this.thread = Parent<RequiredModuleExports, WrapperModuleConfig>(this.module);
		this.thread.exited.catch(this.onCrashed);
		console.log(chalk`Started {${this.config.color} ${this.module}} in {redBright ${Date.now() - startTime}}ms`);
	}

	async kill(force?: boolean): Promise<void> {
		if (this.thread !== null) {
			await this.terminate();
			this.thread = null;
		}
		if (!force && this.config.persistent) await this.start();
	}

	async terminate(): Promise<number | void> {
		if (this.thread !== null) {
			const exitCode = await this.thread.terminate();
			this.thread = null;
			return exitCode;
		}
	}

	enable = async (): Promise<boolean> => (this.config.enabled = true);
	disable = async (): Promise<boolean> => (this.config.enabled = false);
}
