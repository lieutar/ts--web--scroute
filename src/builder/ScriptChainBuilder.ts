import { Prop, QoopObject } from "qoop";
import type { Scroute } from "../app";
import { ScriptChainContext, type IScriptChainContext } from './context';
import type { IResponseWriter } from "../writer";
import type { IResponseBuilder } from "./types";
import type { ActionScript } from "../script";

export interface ScriptChainBuilderProps{
    app: Scroute;
    actions: ActionScript[];
    defaultBuilder: IResponseBuilder;
}

/**
 * Runner of script chain for response building.
 * Building the chain isn't this class' responsibility.
 * See Also: `FsRouter`.
 */
export class ScriptChainBuilder extends QoopObject() implements IResponseBuilder{

  @Prop() app!:            Scroute;
  @Prop() actions!:        ActionScript[];
  @Prop() defaultBuilder!: IResponseBuilder;

  constructor(params: ScriptChainBuilderProps){ super(params); }

  async buildResponse(context:IScriptChainContext, writer: IResponseWriter){

    const loop = async ( actions: ActionScript[], context:IScriptChainContext ) => {
      const mod = actions[0];

      if( 'undefined' !== typeof mod ){
        const newResult  = await mod.execute( context );
        const newContext = new ScriptChainContext({
          app: this.app as any,
          previous: context,
          handlesBy: mod,
          result: newResult});
        return await loop(actions.slice(1), newContext)
      }
      await context.result.builder.buildResponse( context, writer );
      return;
    };

    return await loop(
      this.actions as ActionScript[],
      new ScriptChainContext({
        app: this.app as any,
        previous: context,
        result: { aborted: false, builder: this.defaultBuilder, env: {} }}));
  }
}
