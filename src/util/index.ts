import * as nodeUrl  from 'node:url';
import { packageDirectory } from 'pkg-dir';
import { StaticDriver} from "../driver";
import { FsRouter, type FsRouterProps } from '../router';
import { getLoggerFromCommandLine } from 'fancy-logger';
import { Scroute } from '../app';

export async function staticDriverWithPackageDir(
  params: {importMeta: {url: string}} & FsRouterProps & { distDir: string }) : Promise<StaticDriver>
{
  const pkg= (await packageDirectory({cwd: nodeUrl.fileURLToPath(params.importMeta.url)}))!;
  const distDir=      params.distDir.replace(/^@pkg(?=[\/\\])/, pkg);
  const documentRoot= params.documentRoot.replace(/^@pkg(?=[\/\\])/, pkg);
  const app    = new Scroute({logger: getLoggerFromCommandLine()});
  const router = new FsRouter({... params, app, documentRoot});
  return new StaticDriver({ router, distDir }); }
