import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StatusPage } from './StatusPage';

describe('StatusPage', () => {
  it('shows the title, message and actions', () => {
    render(<StatusPage mark="!" title="Went wrong" message="Try again." actions={<button>Reload</button>} />);

    expect(screen.getByRole('heading', { level: 1, name: 'Went wrong' })).toBeTruthy();
    expect(screen.getByText('Try again.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Reload' })).toBeTruthy();
  });

  it('hides the illustration from screen readers, because the text says everything', () => {
    const { container } = render(<StatusPage mark="?" title="Missing" message="Gone." actions={null} />);
    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('shows the mark on the sign', () => {
    const { container } = render(<StatusPage mark="?" title="Missing" message="Gone." actions={null} />);
    expect(container.querySelector('svg')?.textContent).toContain('?');
  });
});
