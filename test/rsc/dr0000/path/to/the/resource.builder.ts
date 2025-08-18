import {
  BuilderScript,
  type IResponseWriter,
  type IScriptChainContext
} from "@src/index";

export default class extends BuilderScript{
  async buildResponse( ctx: IScriptChainContext, res: IResponseWriter ){
    const buf : {[key:string]:unknown} = {};
    for( const [key, value] of ctx.entries() ) buf[key] = value;
    await res.header({'Content-Type': 'text/plain'});
    await res.write(JSON.stringify(buf));
  }
}
