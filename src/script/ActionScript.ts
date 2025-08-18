import type { Scroute } from '../app';
import type { IScriptChainContext } from '../builder';
import type { IResponseBuilder } from '../builder/types';
import { AbstractHandlerScript }from './AbstractHandlerScript';

export type ActionResultEnvType = { [key:string|symbol] : unknown };

export interface IActionResult {
  aborted: boolean;
  builder: IResponseBuilder;
  env: ActionResultEnvType; };

export const NullIActionResult:IActionResult = {
  aborted: false,
  builder: { async buildResponse(_a,_b){} },
  env: {} };

export type IActionResultOption = Omit<IActionResult, 'env'>;
export type ActionResultOptType = Partial<IActionResultOption>;

/** The base class to *.action.ts scripts.
 * Any *.action.ts scripts have to export subclass of this class.
 */
export abstract class ActionScript extends AbstractHandlerScript {
  abstract execute(context: IScriptChainContext): Promise<IActionResult>; }

/*
This class is so simple, and I sometimes become to be not able to understand
the necessity of this implementing.

However it's must.
Because This class extends AbstractHandlerScript, and the super class has
some fields (including virtual fields).

When if just use `implements IActionScript`, any *.action.ts scripts become
to lose these logic.
 */

export class NullActionScript extends ActionScript {
  // eslint-disable-next-line @typescript-eslint/require-await
  async execute(_: IScriptChainContext){ return NullIActionResult; }
  constructor(params: {app: Scroute}){
    super({documentRoot: "", file: "", suffix: "", ... params}); }}
