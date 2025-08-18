import { HTTP_STATUS } from "../http";
import type { IResponseWriter } from "../writer";
import type { IScriptChainContext } from "./context";
import type { IResponseBuilder } from "./types";

export class MessageBuilder implements IResponseBuilder{

  async buildResponse( context: IScriptChainContext, writer: IResponseWriter ){

    const [status, title,  message] = ((): [number, string, string]=>{
      const estatus = context.get('status');
      const nstatus = estatus === undefined || estatus === null
        ? 200 : Math.floor(Number(estatus));

      if( Number.isNaN(nstatus) || nstatus < 100 || nstatus > 599 ){
        return [500 , '500 Internal Server Error', `Illegal Status ${estatus}`];
      } else {
        const defaultMessage = HTTP_STATUS[nstatus] ?? `Undefined Status`;
        if( defaultMessage === 'Undefined Status' ){
          console.warn( nstatus, defaultMessage );
        }
        return [
          nstatus,
          String( context.get('title') ?? `${nstatus} ${defaultMessage}`),
          String( context.get('message') ?? defaultMessage )
        ];
      }
    })();

    await writer.status( status );
    await writer.header({'Content-Type': 'text/plain'});
    await writer.write( `${title}\n${message}` );
    await writer.close();
  }
}
