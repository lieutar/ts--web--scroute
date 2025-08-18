import type { IScriptChainContext } from '../builder';
import type { IResponseWriter } from '../writer';
import { AbstractResourceHandler } from './AbstractResourceHandler';

export class StaticResourceHandler extends AbstractResourceHandler {
  async buildResponse( _: IScriptChainContext, res: IResponseWriter ){ await res.write({path: this.file}); } }
