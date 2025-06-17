/**
 * @jest-environment node
 */
import fs from 'fs';
import * as logger from '../../../../lib/logger';

describe('logger utils', () => {
  const appendSpy = jest.spyOn(fs, 'appendFileSync').mockImplementation(() => {});
  const mkdirSpy = jest.spyOn(fs, 'mkdirSync').mockImplementation(() => {});

  afterEach(() => {
    appendSpy.mockClear();
    mkdirSpy.mockClear();
  });

  it('masks sensitive fields', () => {
    logger.info('test message', {
      password: 'secret',
      token: 'abcd',
      normal: 'ok'
    });
    expect(appendSpy).toHaveBeenCalled();
    const logged = JSON.parse(appendSpy.mock.calls[0][1]);
    expect(logged.level).toBe('info');
    expect(logged.meta.password).toBe('***');
    expect(logged.meta.token).toBe('***');
    expect(logged.meta.normal).toBe('ok');
  });
});
