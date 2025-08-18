import type { IScriptChainContext } from '../builder';
import type { IResponseWriter } from '../writer';
import { AbstractResourceHandler, type AbstractResourceHandlerProps } from './AbstractResourceHandler';

export class BuilderTsHandler extends AbstractResourceHandler {
  private _entity : BuilderScript | null = null;
  async buildResponse( context: IScriptChainContext, writer: IResponseWriter ){
    if( this._entity === null ){
      const entityClass = (await import ( this.file )).default;
      if( 'function' === typeof entityClass && !(entityClass.prototype instanceof BuilderScript))
        throw new Error( `${this.file} didn't export the subclass of BuilderScript`);
      this._entity = new entityClass({
        app: this.app, documentRoot: this.documentRoot, file: this.file, suffix: this.suffix }); }
    const entity = this._entity;
    if(!entity) throw new Error( 'WTF ???!!!' );
    await entity.buildResponse( context, writer ); }
}

export interface BuilderScriptProps extends AbstractResourceHandlerProps{}

export abstract class BuilderScript  extends AbstractResourceHandler  {
  abstract override buildResponse( context: IScriptChainContext, writer: IResponseWriter) : Promise<void>; }
