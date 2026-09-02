import { describe, expect, it } from '@jest/globals';
import { Earth, multiply } from '../index';

describe('library exports', () => {
  it('exports the multiply helper and Earth component', () => {
    expect(typeof multiply).toBe('function');
    expect(Earth).toBeDefined();
  });
});
