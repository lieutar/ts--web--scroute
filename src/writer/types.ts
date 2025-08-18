import type { HttpMessageBodyType, HttpMessageHeaderType } from "../http";

export interface IResponseWriter {
  status(num: number) : Promise<void>;
  header(headers: HttpMessageHeaderType) : Promise <void>;
  write(body: HttpMessageBodyType) : Promise <void>;
  close() : Promise <void>; }
