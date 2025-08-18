import { expect, describe, test } from 'bun:test';
import { HttpRequest } from '@src/http';

describe('HttpRequest', ()=>{
  test('With no argument', ()=>{
    const req = new HttpRequest();
    expect(req.method).toBe('GET');
    expect(req.path).toBe('/');
    expect(req.queryString).toBe('');
  });

  test('With an argument', ()=>{
    const req = new HttpRequest({
      method: 'POST',
      queryString: '?foo=bar&hoge=fuga',
      header: { 'Content-Type': 'application/x-blah-blah-blah' },
      body: "xyz"
    });
    expect(req.method).toBe('POST');
    expect(req.path).toBe("/");
    expect(req.queryString).toBe('?foo=bar&hoge=fuga');
    expect(req.header['Content-Type']).toBe('application/x-blah-blah-blah');
    expect(req.body).toBe('xyz');
  });
});
