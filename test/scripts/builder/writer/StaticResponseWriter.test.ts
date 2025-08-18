import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { setupMockFs, restoreOriginalFs } from '@looper-utils/fs/mock';
import { StaticResponseWriter } from '@src/index';
import { isDirectory, readFile } from '@looper-utils/fs';
import pathMod from 'path';

describe('StaticResponseWriter', () => {
  beforeEach(async ()=>{ await setupMockFs({ '/tmp/dir' : {} }); });
  afterEach(()=>{ restoreOriginalFs(); });
  test('simple case', async ()=>{
    const dstdir = "/tmp/dir/subdir/subsubdir";
    const path = pathMod.join( dstdir, "foo.txt" );
    const content = "ぶらぶらぶら\n";
    const w = new StaticResponseWriter({ path });
    await w.write(content);
    await w.close();
    expect(await isDirectory(dstdir)).toBe(true);
    expect(String(await readFile(path))).toBe(content);
  })
});
