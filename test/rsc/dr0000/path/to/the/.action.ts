import { ActionScript, type IActionResult, type IScriptChainContext } from '@src/index';

export default class extends ActionScript{
  // eslint-disable-next-line @typescript-eslint/require-await
  async execute(context: IScriptChainContext) : Promise<IActionResult>{
    return context.newResult({
      theKey: 'the value',
    });
  }
}
