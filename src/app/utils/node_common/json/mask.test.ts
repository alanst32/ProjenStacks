import { JsonMask } from './mask';

describe('JsonMask', () => {
  it('masks JSON fields', () => {
    const mask = JsonMask(['password', 'email']);
    const masked = mask({ password: '123', child: { email: 'abc@abc.com' } });
    expect(masked).toEqual({ password: '********', child: { email: '********' } });
  });

  it('uses mask replacement and ignores case', () => {
    const mask = JsonMask(['Password', 'Email'], { replacement: '###', ignoreCase: true });
    const masked = mask({ password: '123', child: { email: 'abc@abc.com' } });
    expect(masked).toEqual({ password: '###', child: { email: '###' } });
  });

  it('skips non object value', () => {
    const mask = JsonMask(['Password', 'Email']);
    const masked = mask('message');
    expect(masked).toEqual('message');
  });
});
