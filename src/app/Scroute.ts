import { Logger } from "fancy-logger";
import { Prop, QoopObject } from "qoop";
import type { Constructor } from "@looper-utils/types";

export interface ScrouteProps{ logger: Logger; };

export class Scroute extends QoopObject(){

  @Prop() logger!: Logger;

  constructor(config: Partial<ScrouteProps> = {}){
    const logger = (config.logger ?? new Logger({})).setTags('scroute');
    super({... config, logger}); }

  private readonly _services:Map<any, any> = new Map();
  registerService<T extends Constructor>(constructor: T, service: InstanceType<T>){
    if(this._services.has(constructor)) throw new Error(`Service '${constructor.name}' is already registered.`);
    this._services.set(constructor, service); }

  service<T extends Constructor>(constructor: T, fallback?: ()=>InstanceType<T>){
    if(!this._services.has(constructor)){
      if(!fallback) throw new Error(`Service '${constructor.name}' is not registered yet.`);
      this.registerService(constructor, fallback()); }
    return this._services.get(constructor)! as InstanceType<T>; }
}
