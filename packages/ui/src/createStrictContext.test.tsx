import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createStrictContext } from './createStrictContext';

describe('createStrictContext', () => {
  it('gives the hook the provider value', () => {
    const [Provider, useValue] = createStrictContext<string>('Plain');
    const Reader = () => <p>{useValue()}</p>;

    render(
      <Provider value="hello">
        <Reader />
      </Provider>,
    );
    expect(screen.getByText('hello')).toBeTruthy();
  });

  it('throws a clear error outside the provider', () => {
    const [, useValue] = createStrictContext<string>('Lonely');
    const Reader = () => <p>{useValue()}</p>;

    expect(() => render(<Reader />)).toThrow('Lonely hook must be used inside LonelyProvider');
  });

  it('keeps working when a hot reload runs the file again, leaving the old provider mounted', () => {
    const [OldProvider] = createStrictContext<string>('Reloaded');
    const [, useNewValue] = createStrictContext<string>('Reloaded');
    const NewReader = () => <p>{useNewValue()}</p>;

    render(
      <OldProvider value="still connected">
        <NewReader />
      </OldProvider>,
    );
    expect(screen.getByText('still connected')).toBeTruthy();
  });
});
