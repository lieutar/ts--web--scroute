import { expect, describe, test } from 'bun:test';
import { HttpResponse } from '@src/http';

describe('HttpResponse', ()=>{
  test('with no argument', ()=>{
    const res = new HttpResponse();
    expect(res.status).toBe(200);
    expect(res.body).toBe("");
    expect(res.header["Content-Type"]).toBe("text/plain");
  });
});
