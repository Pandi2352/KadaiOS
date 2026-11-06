import { describe, expect, it } from 'vitest';
import { formatBytes, matchesAccept, pickFiles } from './fileValue';

const makeFile = (name: string, type = 'application/pdf', size = 10) =>
  new File(['x'.repeat(size)], name, { type, lastModified: 1 });

describe('formatBytes', () => {
  it.each([
    [500, '500 B'],
    [2048, '2 KB'],
    [5 * 1024 * 1024, '5 MB'],
    [1.5 * 1024 * 1024, '1.5 MB'],
  ])('turns %i into %s', (bytes, text) => {
    expect(formatBytes(bytes)).toBe(text);
  });
});

describe('matchesAccept', () => {
  it('allows anything without a rule', () => {
    expect(matchesAccept(makeFile('a.exe'))).toBe(true);
  });

  it('matches extensions, wildcards and exact types', () => {
    expect(matchesAccept(makeFile('BILL.PDF'), '.pdf')).toBe(true);
    expect(matchesAccept(makeFile('a.png', 'image/png'), 'image/*')).toBe(true);
    expect(matchesAccept(makeFile('a.png', 'image/png'), 'image/png, .pdf')).toBe(true);
    expect(matchesAccept(makeFile('a.exe', 'application/x-msdownload'), 'image/*,.pdf')).toBe(false);
  });
});

describe('pickFiles', () => {
  const many = { multiple: true, maxSize: 100 };
  const one = { multiple: false, maxSize: 100 };

  it('adds to the list, without repeats', () => {
    const first = makeFile('a.pdf');
    const { files } = pickFiles([first], [makeFile('a.pdf'), makeFile('b.pdf')], many);
    expect(files.map((file) => file.name)).toEqual(['a.pdf', 'b.pdf']);
  });

  it('replaces the file when only one is allowed', () => {
    const { files } = pickFiles([makeFile('a.pdf')], [makeFile('b.pdf')], one);
    expect(files.map((file) => file.name)).toEqual(['b.pdf']);
  });

  it('keeps the chosen file when its replacement is rejected', () => {
    const { files, rejection } = pickFiles([makeFile('a.pdf')], [makeFile('big.pdf', 'application/pdf', 200)], one);
    expect(files.map((file) => file.name)).toEqual(['a.pdf']);
    expect(rejection).toBe('big.pdf is too large. The limit is 100 B.');
  });

  it('rejects the wrong type but keeps the good files', () => {
    const { files, rejection } = pickFiles([], [makeFile('a.exe'), makeFile('b.png', 'image/png')], {
      ...many,
      accept: 'image/*',
    });
    expect(files.map((file) => file.name)).toEqual(['b.png']);
    expect(rejection).toBe("a.exe isn't an allowed file type.");
  });

  it('stops at the limit', () => {
    const { files, rejection } = pickFiles([makeFile('a.pdf')], [makeFile('b.pdf')], { ...many, maxFiles: 1 });
    expect(files).toHaveLength(1);
    expect(rejection).toBe('You can add up to 1 file.');
  });
});
