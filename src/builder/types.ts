import type { IResponseWriter } from "../writer";
import type { IScriptChainContext } from "./context";

export interface IResponseBuilder {
  buildResponse( context: IScriptChainContext,  writer: IResponseWriter ) : Promise<void>; }
