import { Parent, ParentThread } from "@inrixia/threads";
import chalk from "chalk";

// Import Types
import type { ModuleInfo } from "@spookelton/wrapperHelpers/types";
import type { WrapperModuleConfig } from "./types";

type MI = Required<ModuleInfo>;

/*
/ Module class definition
*/
export default class WrapperModule {
	public readonly module: string;
	private _moduleConfig: WrapperModuleConfig;

	private _persistent: MI["persistent"];
	private _color: MI["color"];
	private _description: MI["description"];

	public moduleInfo?: ModuleInfo;

	public get persistent() {
		return this._persistent;
	}
	public get color() {
		return this._color;
	}
	public get description() {
		return this._description;
	}

	private crashCount: number;
	thread: ParentThread<{ moduleInfo: () => ModuleInfo; init: () => void }> | null;

	public static readonly loadedModules: Record<string, WrapperModule> = {};

	static runningModules = () => Object.values(WrapperModule.loadedModules).filter((module) => module.running);
	static enabledModules = () => Object.values(WrapperModule.loadedModules).filter((module) => module.enabled);

	static loadModules = (modules: Record<string, WrapperModuleConfig>) =>
		Promise.all(
			Object.entries(modules).map(async ([name, config]) => {
				const module = new WrapperModule(name, config);
				if (module.enabled) return module.start();
			})
		);

	constructor(module: string, moduleConfig: WrapperModuleConfig) {
		this.module = module;
		this.crashCount = 0;
		this.thread = null;
		// Set module settings
		this._moduleConfig = moduleConfig;

		// Set exported moduleInfo properties
		this._color = "white";
		this._persistent = false;
		this._description = "No description exported.";
		WrapperModule.loadedModules[module] = this;
	}

	get enabled(): boolean {
		return this._moduleConfig.enabled;
	}
	set enabled(value: boolean) {
		this._moduleConfig.enabled = value;
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
			process.stdout.write(chalk`{red Module Crashed}: {${this.color}${this.module}} Restarting!\n`);
			await this.restart();
		} else {
			if (this.persistent === true)
				process.stdout.write(chalk`{red Module Crashed Repeatedly}: {${this.color}${this.module}} Unable to disable as module is persistant!\n`);
			else {
				process.stdout.write(chalk`{red Module Crashed Repeatedly}: {${this.color}${this.module}} Disabling!\n`);
				if (this.running) this.kill();
			}
		}
		console.log(error);
	}

	async restart(): Promise<void> {
		if (!this.enabled) return;
		await this.kill(true);
		await this.start();
	}

	async start(): Promise<void> {
		if (!this.enabled || this.running) return;
		const startTime = Date.now();
		this.thread = Parent(this.module);
		this.thread.exited.catch(this.onCrashed);
		this.moduleInfo = await this.thread.moduleInfo();
		if (this.moduleInfo !== undefined) {
			this._color = this.moduleInfo.color;
			this._description = this.moduleInfo.description;
			this._persistent = this.moduleInfo.persistent || false;
		}
		console.log(chalk`Started {${this.color} ${this.module}} in {redBright ${Date.now() - startTime}}ms`);
		if (WrapperModule.loadedModules["@spookelton/command"]?.running) {
			// @ts-expect-error loadModuleCommands exists on @spookelton/command
			WrapperModule.loadedModules["@spookelton/command"].thread!.loadModuleCommands({ module: this.module, ...this.moduleInfo });
		}
	}

	async kill(force?: boolean): Promise<void> {
		if (this.thread !== null) {
			await this.terminate();
			this.thread = null;
		}
		if (WrapperModule.loadedModules["@spookelton/command"]?.running) {
			// @ts-expect-error loadModuleCommands exists on @spookelton/command
			WrapperModule.loadedModules["@spookelton/command"].thread!.unloadModuleCommands(this.module);
		}
		if (!force && this.persistent) await this.start();
	}

	async terminate(): Promise<number | void> {
		if (this.thread !== null) {
			const exitCode = await this.thread.terminate();
			this.thread = null;
			return exitCode;
		}
	}
}
