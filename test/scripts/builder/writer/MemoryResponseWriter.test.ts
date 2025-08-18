import { test, expect, describe } from 'bun:test';
import { MemoryResponseWriter } from '@src/writer/MemoryResponseWriter';

// TODO this script is just a STUB.

describe( 'MamoryResponseWriter' , () =>{
  const mrw = new MemoryResponseWriter();
  test('initial state', ()=>{
    expect(mrw.storedStatus).toBe(200);
  });
});
