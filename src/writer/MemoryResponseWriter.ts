import { type HttpMessageBodyType, type HttpMessageHeaderType } from "../http";
import { type  IResponseWriter } from "./types";

export class MemoryResponseWriter implements IResponseWriter{

  // In the future:
  // If multipart response is required, this implementation will should be
  // turned // as `class SinglePartResponseWriter`.

  #status        = 200;
  #storedHeaders : {[field:string]: string[]} = {};
  #storedBodies : HttpMessageBodyType[]  = [];

  get storedStatus() { return this.#status; }
  get storedHeaders(){ return this.#storedHeaders; }
  get storedBodies() { return this.#storedBodies; }

  // eslint-disable-next-line @typescript-eslint/require-await
  async status(code: number){ this.#status = code; }

  // eslint-disable-next-line @typescript-eslint/require-await
  async header(header: HttpMessageHeaderType){
    for(const key in header){
      this.#storedHeaders[key] ??= [];
      const value = (()=>{
        if(Array.isArray(header[key])) return header[key];
        if('string' === typeof header[key]) return [header[key]];
        return null;
      })();
      if(value)  this.#storedHeaders[key].push( ... value );
    }
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async write(body: HttpMessageBodyType){
    this.storedBodies.push( body );
  }

  // async flush() is required for multipart support.(but it isn't necessary now)
  async close(){
    /* ignore */
  }

}
