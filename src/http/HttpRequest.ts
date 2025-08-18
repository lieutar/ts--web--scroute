import { Prop, QoopObject } from 'qoop';
import type { IHttpRequest, HttpMessageHeaderType, HttpMessageBodyType } from './types';

export class HttpRequest extends QoopObject() implements IHttpRequest {
  @Prop() header!     : HttpMessageHeaderType;
  @Prop() body!       : HttpMessageBodyType;
  @Prop() method!     : string;
  @Prop() path!       : string;
  @Prop() queryString!: string;
  static makdeDefaultProps(){
    return { header: {}, body: '', method: 'GET', path: '/', queryString: '' }; }

  constructor( params: Partial<IHttpRequest> = {}){
    super({... HttpRequest.makdeDefaultProps(), ... params}); }
}
