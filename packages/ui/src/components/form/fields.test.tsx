import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ComponentProps, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { NumberField } from './number/NumberField';
import { PasswordField } from './PasswordField';
import { TextareaField } from './TextareaField';
import { TextField } from './TextField';

function Text(props: Partial<ComponentProps<typeof TextField>>) {
  const [value, setValue] = useState('');
  return <TextField label="Name" value={value} onChange={setValue} {...props} />;
}

function Quantity(props: Partial<ComponentProps<typeof NumberField>>) {
  const [value, setValue] = useState('');
  return <NumberField label="Quantity" value={value} onChange={setValue} {...props} />;
}

describe('common fields', () => {
  it('marks required fields, without adding to the name screen readers hear', () => {
    render(<Text required />);
    const input = screen.getByRole('textbox', { name: 'Name' });
    expect(input.getAttribute('aria-required')).toBe('true');
    expect(screen.getByText('*')).toBeTruthy();
  });

  it('shows the hint until there is an error, then only the error', () => {
    const { rerender } = render(<Text hint="Your full name" />);
    expect(screen.getByText('Your full name')).toBeTruthy();

    rerender(<Text hint="Your full name" error="Name is required" />);
    expect(screen.queryByText('Your full name')).toBeNull();
    const input = screen.getByRole('textbox', { name: /Name/ });
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe(screen.getByText('Name is required').id);
  });

  it('shows the placeholder', () => {
    render(<Text placeholder="Your full name" />);
    expect(screen.getByPlaceholderText('Your full name')).toBeTruthy();
  });

  it('clears the value and returns focus to the field', async () => {
    render(<Text clearable />);
    const input = screen.getByRole('textbox', { name: /Name/ }) as HTMLInputElement;
    expect(screen.queryByRole('button', { name: 'Clear name', hidden: true })).toBeNull();

    await userEvent.type(input, 'Kavi');
    await userEvent.click(screen.getByRole('button', { name: 'Clear name', hidden: true }));

    expect(input.value).toBe('');
    expect(document.activeElement).toBe(input);
  });

  it('counts characters', async () => {
    render(<Text showCount maxLength={10} />);
    await userEvent.type(screen.getByRole('textbox', { name: /Name/ }), 'Kavi');
    expect(screen.getByText('4/10')).toBeTruthy();
  });

  it('counts characters in a text area', () => {
    render(<TextareaField label="Notes" value="Hello" onChange={vi.fn()} showCount maxLength={500} />);
    expect(screen.getByText('5/500')).toBeTruthy();
  });

  it('focuses the input when its padding is clicked', () => {
    render(<Text />);
    const input = screen.getByRole('textbox', { name: /Name/ });
    fireEvent.mouseDown(input.parentElement as HTMLElement);
    expect(document.activeElement).toBe(input);
  });

  it('disables the whole field', () => {
    render(<Text disabled clearable value="Kavi" />);
    expect((screen.getByRole('textbox', { name: /Name/ }) as HTMLInputElement).disabled).toBe(true);
    expect(screen.queryByRole('button', { name: 'Clear name', hidden: true })).toBeNull();
  });
});

describe('PasswordField', () => {
  function Password(props: Partial<ComponentProps<typeof PasswordField>>) {
    const [value, setValue] = useState('');
    return <PasswordField label="Password" value={value} onChange={setValue} autoComplete="new-password" {...props} />;
  }

  it('shows and hides the password', async () => {
    render(<Password />);
    const input = screen.getByLabelText(/Password/, { selector: 'input' }) as HTMLInputElement;
    expect(input.type).toBe('password');
    await userEvent.click(screen.getByRole('button', { name: 'Show password', hidden: true }));
    expect(input.type).toBe('text');
  });

  it('warns about Caps Lock until the field is left', () => {
    render(<Password />);
    const input = screen.getByLabelText(/Password/, { selector: 'input' });
    fireEvent.keyDown(input, { key: 'A', modifierCapsLock: true });
    expect(screen.getByText('Caps Lock is on')).toBeTruthy();
    fireEvent.blur(input);
    expect(screen.queryByText('Caps Lock is on')).toBeNull();
  });

  it('only rates strength when asked and once there is a password', async () => {
    const { unmount } = render(<Password />);
    await userEvent.type(screen.getByLabelText(/Password/, { selector: 'input' }), 'lowercase');
    expect(screen.queryByText('Weak')).toBeNull();
    unmount();

    render(<Password showStrength />);
    expect(screen.queryByText(/Password strength/)).toBeNull();
    await userEvent.type(screen.getByLabelText(/Password/, { selector: 'input' }), 'lowercase');
    expect(screen.getByText('Weak')).toBeTruthy();
  });
});

describe('NumberField', () => {
  const input = () => screen.getByRole('textbox', { name: /Quantity/ }) as HTMLInputElement;

  it('only accepts numbers', async () => {
    render(<Quantity />);
    await userEvent.type(input(), '1a2.5b5');
    expect(input().value).toBe('12.55');
  });

  it('respects the number of decimals', async () => {
    render(<Quantity decimals={0} />);
    await userEvent.type(input(), '4.5');
    expect(input().value).toBe('45');
    expect(input().inputMode).toBe('numeric');
  });

  it('steps with the arrow keys and stays in range', async () => {
    render(<Quantity min={0} max={2} />);
    await userEvent.click(input());
    await userEvent.keyboard('{ArrowUp}{ArrowUp}{ArrowUp}{ArrowUp}');
    expect(input().value).toBe('2');
  });

  it('steps with buttons and turns them off at the limit', async () => {
    render(<Quantity steppers min={0} max={1} />);
    const increase = screen.getByRole('button', { name: 'Increase', hidden: true }) as HTMLButtonElement;
    await userEvent.click(increase);
    await userEvent.click(increase);
    expect(input().value).toBe('1');
    expect(increase.disabled).toBe(true);
  });

  it('shows units', () => {
    render(<Quantity startText="₹" endText="kg" />);
    expect(screen.getByText('₹')).toBeTruthy();
    expect(screen.getByText('kg')).toBeTruthy();
  });
});
