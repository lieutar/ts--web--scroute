import pathMod from 'path';
import { getStats, mkdir, copyFile, openFile, readFile, type IFileHandle } from '@looper-utils/fs';
import { isHttpMessageBodyPathSpecifierType, type HttpMessageBodyType, type HttpMessageHeaderType } from "../http";
import { type  IResponseWriter } from "./types";

export class StaticResponseWriter implements IResponseWriter{

  private _opened: boolean = false;
  private _bodies: HttpMessageBodyType[] = [];
  readonly path: string;

  constructor (params: {path: string}){
    this.path = params.path; }

  // eslint-disable-next-line @typescript-eslint/require-await
  async _open(){
    if(this._opened) return;
    this._bodies = [];
    this._opened = true; }

  async status( _: number ) { await this._open(); }
  async header( _: HttpMessageHeaderType ) { await this._open(); }

  async write(body: HttpMessageBodyType) {
    await this._open();
    this._bodies.push(body); }

  private async _beforeFlush (){
    const dir = pathMod.dirname( this.path );
    const stats = await getStats(dir);
    if( stats ){
      if(stats.isDirectory()) return;
      throw new Error(`${dir} is not a directory`); }
    await mkdir(dir); }

  async flush(){
    if(!this._opened) return;
    const bodies = this._bodies;
    this._bodies = [];

    await this._beforeFlush();

    if( bodies.length === 1 && isHttpMessageBodyPathSpecifierType(bodies[0]) ){
      await copyFile(bodies[0].path, this.path);
      return; }

    let fh: IFileHandle | undefined;
    try{
      fh = await openFile(this.path, 'w');
      for(const body of bodies){
        if (isHttpMessageBodyPathSpecifierType(body)) {
          const fileContent = await readFile(body.path);
          await fh.write(fileContent);
        } else if( 'string' === typeof body ){
          await fh.write(body);
        } else if( body instanceof Buffer ){
          await fh.write(body);
        } else {
          throw new Error("Unsupported HttpMessageBodyType encountered.");
        }
      }
    }catch(e){
        throw e;
    }finally{
      if(fh) await fh.close();
      this._opened = false;
    }
  }

  async close() { await this.flush(); }

}
