import { isObject } from "@looper-utils/types";

export type HttpMessageHeaderType = { [headerName:string] : string | string[] };
export type HttpMessageBodyPathSpecifierType = {path: string};
export type HttpMessageBodyType =
 string | Buffer | HttpMessageBodyPathSpecifierType;

export function isHttpMessageBodyPathSpecifierType(
  o:any
) : o is HttpMessageBodyPathSpecifierType {
  return ( isObject(o) && typeof o.path === 'string' );
}

export function isHttpMessageBodyType( o:any ) : o is HttpMessageBodyType{
  if( o instanceof Buffer ) return true;
  if( typeof o == 'string' ) return true;
  return ( isObject(o) && typeof o.path === 'string' );
}

export interface IHttpMessage {
  header: HttpMessageHeaderType,
  body: HttpMessageBodyType
}

export function isIHttpMessage (o:any) : o is IHttpMessage {
  if(!isObject( o )) return false;
  const {header, body} = o;
  if(!isObject(header)) return false;
  return isHttpMessageBodyType(body);
}

export interface IHttpRequest extends IHttpMessage{
  method: string;
  path: string;
  queryString: string;
}

export function isIHttpRequest (o: any) : o is IHttpRequest {
  if(!isIHttpMessage(o)) return false;
  const {method, path, queryString} = o as IHttpRequest;
  return ( 'string' === typeof method &&
           'string' === typeof path &&
           'string' === typeof queryString );
}

export interface IHttpResponse extends IHttpMessage{
  status: number;
}

export function isIHttpReqponse (o: any) : o is IHttpMessage {
  if(!isIHttpMessage(o)) return false;
  const {status} = o as IHttpResponse;
  return ( 'number' === typeof status );
}
