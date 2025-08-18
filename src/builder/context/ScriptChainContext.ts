import { type  IHttpRequest } from '../../http';
import type { Scroute } from '../../app';
import type { IResponseBuilder } from '../types';
import { NullIActionResult, type ActionResultEnvType, type IActionResult, type ActionScript, NullActionScript
} from '../../script';

export interface IAppContext { documentRoot: string, };

export interface IScriptChainContext {
  readonly app: Scroute,
  isStatic:     boolean,
  isRoot:       boolean,
  builder:      IResponseBuilder,
  handlesBy:    ActionScript,
  previous:     IScriptChainContext,
  request:      IHttpRequest,
  result:       IActionResult,
  env:          ActionResultEnvType,
  get(key:string): unknown;
  newResult( env: ActionResultEnvType, opt?: {aborted?: boolean, builder?: IResponseBuilder} ) : IActionResult;
  entries(): [string, unknown][];
}

abstract class AbstractScriptChainContext implements IScriptChainContext {

  abstract get result(): IActionResult;
  abstract get isRoot(): boolean;
  abstract get previous(): IScriptChainContext;
  abstract get request(): IHttpRequest;
  abstract get handlesBy(): ActionScript;
  abstract get isStatic(): boolean;

  get isDynamic   (){ return !this.isStatic; }

  get builder() : IResponseBuilder { return this.result.builder; }
  get env() : {[key:string]: unknown} { return this.result.env; }

  get(key: string): unknown{
    if( this.env.hasOwnProperty(key) ) return this.env[key];
    if(this.isRoot) return undefined;
  }

  entries(): [string, unknown][]{
    const all:ActionResultEnvType = {};
    const loop = ( slot:IScriptChainContext )=>{
      for( const [key, value] of Object.entries( slot.env ) ){
        if( key in all ) continue;
        all[key] = value;
      }
      if( slot.isRoot ) return;
      loop(slot.previous);
    };
    loop( this );
    return Object.entries(all);
  }

  newResult(
    env: ActionResultEnvType,
    opt: {aborted?: boolean, builder?: IResponseBuilder} = {}
  ) : IActionResult{
    const aborted = opt.aborted ?? false;
    const builder = opt.builder ?? this.builder;
    return { aborted, builder, env }
  }

  readonly app: Scroute;
  constructor(params: {app: Scroute}){
    this.app = params.app;
  }
}

export class ScriptChainContext extends AbstractScriptChainContext{
  get isRoot () : boolean{ return false; }
  #handlesBy: ActionScript;
  get handlesBy (){ return this.#handlesBy; }

  #previous: IScriptChainContext;
  get previous(){ return this.#previous; }

  #result: IActionResult;
  get result() { return this.#result; }

  get isStatic    (){ return this.#previous.isStatic; }
  get request     (){ return this.#previous.request; }

  constructor( params : {
    app: Scroute,
    handlesBy?: ActionScript,
    previous: IScriptChainContext,
    result: IActionResult
  }) {
    super(params);
    this.#previous        = params.previous;
    this.#handlesBy       = params.handlesBy ?? new NullActionScript({app: this.app});
    this.#result          = params.result;
  }
}

export class ScriptChainContextRoot extends AbstractScriptChainContext {
  #request : IHttpRequest;
  get request(): IHttpRequest { return this.#request; }

  #isStatic : boolean;
  get isStatic() { return this.#isStatic; }

  constructor(params: {isStatic: boolean, request: IHttpRequest, app: Scroute}){
    super(params);
    this.#isStatic = params.isStatic;
    this.#request = params.request;
  }

  get result(): IActionResult { return  NullIActionResult; }
  get isRoot(): boolean { return true; }
  get previous(): IScriptChainContext { return this; }
  get handlesBy(): ActionScript { return new NullActionScript({app: this.app}); }

}
