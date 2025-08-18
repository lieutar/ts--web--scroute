import { AbstractHandlerScript, type AbstractHandlerScriptProps} from '../script';
import type { IResponseWriter } from '../writer';
import type { IResponseBuilder } from '../builder/types';
import type { IScriptChainContext } from '../builder';

export interface IResponseBuilderScriptClass {
  new (params: AbstractResourceHandlerProps ) : AbstractResourceHandler; }

export interface AbstractResourceHandlerProps extends AbstractHandlerScriptProps{}

export abstract class AbstractResourceHandler extends AbstractHandlerScript
 implements IResponseBuilder {
   abstract buildResponse(
     context: IScriptChainContext, writer: IResponseWriter) : Promise<void>;
}
