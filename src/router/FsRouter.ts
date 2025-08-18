import nodePath from 'path';
import { LazyInit, Prop, QoopObject } from 'qoop';
import { isFile } from '@looper-utils/fs';
import type { PPick } from '@looper-utils/types';

import { ScriptChainBuilder } from '../builder';
import { HttpRequest, type IHttpRequest, } from '../http';
import type { Scroute } from '../app';
import { AbstractResourceHandler, BuilderTsHandler, StaticResourceHandler,
  type IResponseBuilderScriptClass } from '../resourceHandler';
import { ActionScript } from '../script';
import { quotemeta } from '@looper-utils/string';
import { canonicalizeDirectoryPath } from '@looper-utils/path';

type CompiledSuffixRulesType = [string, RegExp, IResponseBuilderScriptClass];
type BuilderInfoType = [string, RegExp, AbstractResourceHandler];

export interface FsRouterProps {
  app:          Scroute;
  documentRoot: string;
  actionSuffix: string;
  directoryIndex: string[];
  suffixRules:  SuffixRuleType[]; };

export type FsRouterParams = PPick<FsRouterProps, 'app'|'documentRoot'>;

export type SuffixRuleType = [string, IResponseBuilderScriptClass ];

export const defaultSuffixRules = [
  ['.builder.ts', BuilderTsHandler],
  ['',            StaticResourceHandler]
] as SuffixRuleType[];

/***/
export class FsRouter extends QoopObject(){

  @Prop() app!: Scroute;
  get logger(){ return this.app.logger; }
  @Prop() documentRoot!: string;
  @Prop() actionSuffix!: string;
  @Prop() directoryIndex!: string[];
  @Prop() suffixRules!: SuffixRuleType[];

  static makeDefaultProps(){ return {
    actionSuffix: '.action.ts',
    directoryIndex: ['index', 'index.html', 'index.htm', 'index.text', 'index.txt'],
    suffixRules: defaultSuffixRules, } }

  constructor(params: FsRouterParams){
    super({... FsRouter.makeDefaultProps(), ...params});
    this.app.registerService(FsRouter, this); }

  readonly builders: { [path:string]:BuilderInfoType } = {};
  readonly actions:  { [path:string]:ActionScript   } = {};

  async findIndex(path: string):Promise<string>{
    const suffixRules = this.suffixRules;
    for(const index of this.directoryIndex){
      for(const [suffix] of suffixRules){
        const candidate = nodePath.join(path, index + suffix);
        if(await isFile(nodePath.join(this.documentRoot, candidate)))
          return candidate.replace(new RegExp(suffix + '$'), '');
      }
    }
    throw new Error();
  }

  @LazyInit()
  private get _compiledSuffixRules (): CompiledSuffixRulesType[]{
    return this.suffixRules.map( ([suffix, builderClass]) =>
      [suffix, new RegExp(`${quotemeta(suffix)}$`), builderClass] ); }

  private _fileToBuilderClass(path: string) :
   [string, RegExp, IResponseBuilderScriptClass]{
    for( const [suffix, pattern, builderClass] of this._compiledSuffixRules ){
      if(pattern.test(path)) return [suffix, pattern,  builderClass]; }
    throw new Error(
      `Couldn't find suitable builder class for the file "${path}"`); }

  private _fileToBuilder(path: string): BuilderInfoType {
    if( 'undefined' === typeof this.builders[path] ){
      const [suffix, pattern, builderClass] = this._fileToBuilderClass(path);
      const builder = new builderClass({
        file: path, documentRoot: this.documentRoot, app: this.app as any, suffix });
      this.builders[path] = [suffix, pattern,  builder]; }
    return this.builders[path]; }

  // eslint-disable-next-line @typescript-eslint/require-await
  async fileToRequests(path: string) : Promise<IHttpRequest[]> {
    const [_, pattern] = this._fileToBuilder(path);
    const reqPath = "/" + nodePath.relative(this.documentRoot, path).replace(pattern, '');
    return [new HttpRequest({path: reqPath})] }

  async requestToScriptChain(req: IHttpRequest) : Promise<ScriptChainBuilder> {

    const origPath = req.path;
    const documentRoot = this.documentRoot;
    const resourceWithNoSuffix = nodePath.join(documentRoot, origPath );

    const defaultBuilder = await( async() : Promise<AbstractResourceHandler> =>{
      for( const [suffix] of this.suffixRules ){
        const cand = resourceWithNoSuffix + suffix;
        if( ! await isFile( cand ) ) continue;
        const [_a, _b, result] = this._fileToBuilder( cand );
        return result;
      }
      throw new Error("Default suffix rule is not specified");
    })();

    const loop = async(path : string, actions : ActionScript[]):Promise<ActionScript[]>=>{
      const newActions = await(async()=>{
        const actionTs = `${path}${this.actionSuffix}`;
        if(await isFile(actionTs)){
          const actionMod = await import(actionTs);
          const actionClass = actionMod.default;
          if(!(actionClass && 'function' === typeof actionClass &&
               actionClass.prototype instanceof ActionScript))
            throw new Error(`${actionTs} doesn't export a subclass of ActionScript as the default.`);
          const action = new actionClass({
            app:          this.app,
            documentRoot: this.documentRoot,
            file:         actionTs,
            suffix:       this.actionSuffix,
          });
          return [action, ... actions];
        }else{
          return [... actions];
        }})();
      return ( path == documentRoot + '/' ? newActions :
        loop(canonicalizeDirectoryPath(nodePath.dirname(path)) + '/', newActions ));
    };
    const actions = await loop( resourceWithNoSuffix, [] as ActionScript[] );
    return new ScriptChainBuilder({defaultBuilder, actions, app: this.app as any});
  }

}
