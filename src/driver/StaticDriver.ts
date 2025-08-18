import nodePath from 'path';
import { isDirectory, readDir } from '@looper-utils/fs';
import { type IHttpRequest } from '../http';
import { StaticResponseWriter } from '../writer';
import { FsRouter } from '../router/FsRouter';
import { ScriptChainContextRoot, type IScriptChainContext } from '../builder';
import { Prop, QoopObject } from 'qoop';
import { quotemeta } from '@looper-utils/string';

export interface StaticDriverProps { router: FsRouter; distDir: string; };

export class StaticDriver extends QoopObject(){

  @Prop() distDir!: string;
  @Prop() router!: FsRouter;
  get documentRoot(){ return this.router.documentRoot; }
  get actionSuffix(){ return this.router.actionSuffix; }
  get app(){ return this.router.app; }
  get logger(){ return this.app.logger; }
  get isDebug(){ return this.app.logger.config.level === 'debug'; }


  /**
   */
  async plan() : Promise<IHttpRequest[]> {
    const actionPattern = new RegExp(`${quotemeta(this.actionSuffix)}$`);
    const src = this.documentRoot;
    const router = this.router;
    const plan = async ( dir : string , src : string ):Promise<IHttpRequest[]> =>{
      if(!(await isDirectory(dir))) throw new Error(`${dir} is not a directory.`);
      const entries = await readDir( dir );
      const result = [];
      for( const entry of entries ){
        const {name} = entry;
        if(name.match(actionPattern)) continue;
        const epath = nodePath.join( dir, name );
        if ( entry.isDirectory() ){
          result.push(  ... await plan( epath , src ) );
        } else {
          result.push( ... await router.fileToRequests( epath ) );
        }
      }
      return result;
    };
    return plan( src, src );
  }

  /**
   */
  async build() : Promise<void> {
    const router  = this.router;
    const distDir = this.distDir;
    const jobs : Promise<void>[] = [];
    for( const req of  await this.plan() ){

      const builder = await router.requestToScriptChain(req);
      const context:IScriptChainContext = new ScriptChainContextRoot({ isStatic: true, request: req, app: this.app });
      const writer = new StaticResponseWriter({path: nodePath.join(distDir, req.path)});
      const job = (async () => {
        const path = nodePath.relative( process.cwd(), writer.path );
        this.logger.debug('start process', path);
        await builder.buildResponse( context, writer );
        await writer.close();
        this.logger.success( path );
      })();
      if(this.isDebug){
        await job;
      }else{
        jobs.push(job);
      }
    }
    if(!this.isDebug) await Promise.all(jobs);
  }

  /**
   */
  constructor (params : StaticDriverProps){ super(params); }
}
