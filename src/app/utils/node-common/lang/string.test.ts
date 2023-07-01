import { fillTemplate } from './string';

describe('fillTemplate', () => {
  it('fills template with values', () => {
    const values = { aa: 'bb', cc: 'dd', ee: undefined, bool: false, num: 1.233 };
    expect(fillTemplate('aa', values, false)).toBe('bb');
    expect(fillTemplate('-{{aa}}-${cc}-', values)).toBe('-bb-dd-');
    expect(fillTemplate('-${aa}-{{cc}}-', values)).toBe('-bb-dd-');
    expect(fillTemplate('-${aa}-{{bool}}-', values)).toBe('-bb-false-');
    expect(fillTemplate('-${aa}-{{num}}-', values)).toBe('-bb-1.233-');
    expect(fillTemplate('-${ab}-{cc}-{ee}', values)).toBe('-${ab}-dd-undefined');
  });
});
