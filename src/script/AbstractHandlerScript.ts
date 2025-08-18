import nodePath from 'path';
import { LazyInit, Prop, QoopObject } from 'qoop';
import { quotemeta } from '@looper-utils/string';

import type { Scroute } from '../app';

export interface AbstractHandlerScriptProps {
  app:          Scroute;
  documentRoot: string;
  file:         string;
  suffix:       string; }

export abstract class AbstractHandlerScript extends QoopObject() {
  @Prop() app!          : Scroute;
  @Prop() documentRoot! : string;
  @Prop() file!         : string;
  @Prop() suffix!       : string;
  @LazyInit() get dir () : string { return nodePath.dirname(this.file); }
  @LazyInit() get requestPath(): string{ return "/"+ nodePath.relative(this.documentRoot, this.file)
    .replace(new RegExp( quotemeta(this.suffix) + '$' ), ''); }
  constructor( params: AbstractHandlerScriptProps){ super(params); } }
