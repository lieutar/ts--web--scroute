import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import { StaticDriver, ScriptChainBuilder, type StaticDriverProps, FsRouter, Scroute } from '@src/index';
import { setupMockFs, restoreOriginalFs } from '@looper-utils/fs/mock';

import nodePath from 'node:path';
import { fileURLToPath } from 'node:url';
import { packageDirectory } from 'pkg-dir';
import { isDirectory, readFile } from '@looper-utils/fs';
import { HttpRequest } from '@src/http';

const PROOT = (await packageDirectory({cwd: fileURLToPath(import.meta.url)}))!;
const TRSC  = nodePath.join(PROOT, 'test/rsc');

describe( 'StaticDriver', () => {

  const documentRoot = nodePath.join(TRSC, 'dr0000');
  const distDir = '/tmp/dist';

  const router  = new FsRouter( {documentRoot, app: new Scroute()} );
  const config: StaticDriverProps = { distDir, router,};

  beforeEach( async () => {
    await setupMockFs({
      '/tmp/': {},
      [documentRoot]: true
    })} );
  afterEach(restoreOriginalFs);

  describe('router', ()=>{
    test('fileToRequests', async () => {
      const app = new StaticDriver(config);
      const reqs = await app.router.fileToRequests(
        nodePath.join(documentRoot, 'path/to/the/resource.builder.ts'));
      expect(reqs.length).toBe(1);
      expect(reqs.length > 0 && reqs[0]!.path).toBe('/path/to/the/resource');
    });

    test('requestToScriptChain', async () => {
      const app = new StaticDriver(config);
      const chain = await app.router.requestToScriptChain(
        new HttpRequest({path: '/path/to/the/resource'}));
      expect(chain instanceof ScriptChainBuilder).toBe(true);
      expect(chain.actions.length).toBe(4);
      expect((chain.defaultBuilder as any).file)
        .toBe(nodePath.join(documentRoot, '/path/to/the/resource.builder.ts'));
    });
  });

  test('plan', async ()=>{
    const app = new StaticDriver(config);
    const plan = await app.plan();
    expect(plan.length).toBe(1);
    expect(plan.length > 0 && plan[0]!.path).toBe('/path/to/the/resource');
  });

  test('build', async ()=>{
    const app = new StaticDriver(config);
    await app.build();
    expect(await isDirectory(distDir)).toBe(true);
    expect(JSON.parse( String(await readFile(nodePath.join(distDir, 'path/to/the/resource')))))
      .toEqual({
        resourceKey: "resource value",
        keyWillOverwride: "resource value (overridden)",
        theKey: "the value",
        pathKey: "path value",
        rootKey: "root value",
      });
  });

});
