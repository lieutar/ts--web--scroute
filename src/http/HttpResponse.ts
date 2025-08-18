import { Prop, QoopObject } from 'qoop';
import { type IHttpResponse, type HttpMessageHeaderType, type HttpMessageBodyType} from './types';

export class HttpResponse extends QoopObject() implements IHttpResponse {
  static makeDefaultProps(){ return {status: 200, header: {'Content-Type' : 'text/plain'}, body: ''}}
  @Prop() header!: HttpMessageHeaderType;
  @Prop() body!  : HttpMessageBodyType;
  @Prop() status!: number;
  constructor( params: Partial<IHttpResponse> = {} ){
    super({... HttpResponse.makeDefaultProps(), ... params });}
}
