import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ComponentProps, useState } from 'react';
import { describe, expect, it } from 'vitest';
import { useForm } from '../../hooks/useForm';
import { DateField } from './DateField';
import { FileField } from './file/FileField';
import { RadioGroupField } from './RadioGroupField';

const OPTIONS = [
  { value: 'cash', label: 'Cash', description: 'Paid at the counter' },
  { value: 'upi', label: 'UPI' },
  { value: 'card', label: 'Card', disabled: true },
] as const;

function PaymentForm() {
  const { field, handleSubmit } = useForm<{ method: string }>({
    initialValues: { method: '' },
    rules: { method: { label: 'Payment method', required: true } },
    onSubmit: async () => undefined,
  });
  return (
    <form noValidate onSubmit={handleSubmit}>
      <RadioGroupField {...field('method')} label="Payment method" options={[...OPTIONS]} />
      <p data-testid="value">{field('method').value}</p>
      <button type="submit">Save</button>
    </form>
  );
}

describe('RadioGroupField', () => {
  it('names the group and shows descriptions', () => {
    render(<PaymentForm />);
    expect(screen.getByRole('radiogroup', { name: /Payment method/ })).toBeTruthy();
    expect(screen.getByText('Paid at the counter')).toBeTruthy();
  });

  it('selects an option, and not a disabled one', async () => {
    render(<PaymentForm />);
    await userEvent.click(screen.getByRole('radio', { name: 'Card' }));
    expect(screen.getByTestId('value').textContent).toBe('');

    await userEvent.click(screen.getByRole('radio', { name: 'UPI' }));
    expect(screen.getByTestId('value').textContent).toBe('upi');
  });

  it('shows the required error and focuses the first radio', async () => {
    render(<PaymentForm />);
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(screen.getByText('Payment method is required')).toBeTruthy();
    expect(screen.getByRole('radiogroup', { name: /Payment method/ }).getAttribute('aria-invalid')).toBe('true');
    expect(document.activeElement).toBe(screen.getByRole('radio', { name: /Cash/ }));
  });
});

function Dates(props: Partial<ComponentProps<typeof DateField>>) {
  const [value, setValue] = useState(props.value ?? '');
  return (
    <>
      <DateField label="Expiry date" {...props} value={value} onChange={setValue} />
      <p data-testid="value">{value}</p>
    </>
  );
}

describe('DateField', () => {
  const trigger = () => screen.getByRole('button', { name: /Expiry date/ });
  const day = (label: string) => screen.getByRole('gridcell', { name: label }) as HTMLButtonElement;

  it('shows the placeholder, then the chosen date in a readable format', async () => {
    render(<Dates value="2026-11-06" />);
    expect(trigger().textContent).toContain('6 Nov 2026');

    await userEvent.click(trigger());
    await userEvent.click(day('10 Nov 2026'));

    expect(screen.getByTestId('value').textContent).toBe('2026-11-10');
    expect(screen.queryByRole('grid')).toBeNull();
    expect(document.activeElement).toBe(trigger());
  });

  it('moves with the keyboard and picks with Enter', async () => {
    render(<Dates value="2026-11-06" />);
    await userEvent.click(trigger());
    expect(document.activeElement).toBe(day('6 Nov 2026'));

    await userEvent.keyboard('{ArrowRight}{ArrowDown}');
    expect(document.activeElement).toBe(day('14 Nov 2026'));

    await userEvent.keyboard('{PageDown}');
    expect(document.activeElement).toBe(day('14 Dec 2026'));

    await userEvent.keyboard('{Enter}');
    expect(screen.getByTestId('value').textContent).toBe('2026-12-14');
  });

  it('changes the month with the buttons', async () => {
    render(<Dates value="2026-11-06" />);
    await userEvent.click(trigger());
    await userEvent.click(screen.getByRole('button', { name: 'Next month', hidden: true }));
    expect(screen.getByRole('grid', { name: 'December 2026' })).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Previous year', hidden: true }));
    expect(screen.getByRole('grid', { name: 'December 2025' })).toBeTruthy();
  });

  it('turns off days outside the range, and stops the keyboard there', async () => {
    render(<Dates value="2026-11-06" min="2026-11-05" max="2026-11-07" />);
    await userEvent.click(trigger());

    expect(day('4 Nov 2026').disabled).toBe(true);
    expect(day('8 Nov 2026').disabled).toBe(true);
    expect((screen.getByRole('button', { name: 'Next month', hidden: true }) as HTMLButtonElement).disabled).toBe(true);

    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(day('7 Nov 2026'));
  });

  it('closes with Escape and returns focus', async () => {
    render(<Dates />);
    await userEvent.click(trigger());
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('grid')).toBeNull();
    expect(document.activeElement).toBe(trigger());
  });

  it('can be cleared when allowed', async () => {
    render(<Dates value="2026-11-06" clearable />);
    await userEvent.click(trigger());
    await userEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(screen.getByTestId('value').textContent).toBe('');
  });

  it('does not open when disabled', async () => {
    render(<Dates disabled />);
    await userEvent.click(trigger());
    expect(screen.queryByRole('grid')).toBeNull();
  });
});

function Files(props: Partial<ComponentProps<typeof FileField>>) {
  const [value, setValue] = useState<File[]>([]);
  return <FileField label="Bill" {...props} value={value} onChange={setValue} />;
}

describe('FileField', () => {
  const pdf = new File(['x'], 'bill.pdf', { type: 'application/pdf' });
  const input = () => screen.getByLabelText(/Bill/, { selector: 'input' }) as HTMLInputElement;

  it('adds a chosen file and removes it again', async () => {
    render(<Files />);
    await userEvent.upload(input(), pdf);
    expect(screen.getByText('bill.pdf')).toBeTruthy();

    await userEvent.click(screen.getByRole('button', { name: 'Remove bill.pdf', hidden: true }));
    expect(screen.queryByText('bill.pdf')).toBeNull();
  });

  it('accepts dropped files', () => {
    render(<Files />);
    fireEvent.drop(screen.getByText(/drag/).closest('label') as HTMLElement, { dataTransfer: { files: [pdf] } });
    expect(screen.getByText('bill.pdf')).toBeTruthy();
  });

  it('explains a dropped file of the wrong type, under the field', () => {
    render(<Files accept="image/*" />);
    fireEvent.drop(screen.getByText(/drag/).closest('label') as HTMLElement, { dataTransfer: { files: [pdf] } });

    expect(screen.queryByRole('list', { name: 'Chosen files' })).toBeNull();
    expect(screen.getByText("bill.pdf isn't an allowed file type.")).toBeTruthy();
    expect(input().getAttribute('aria-invalid')).toBe('true');
  });

  it('explains a file that is too large', async () => {
    render(<Files maxSize={0} />);
    await userEvent.upload(input(), pdf);
    expect(screen.getByText('bill.pdf is too large. The limit is 0 B.')).toBeTruthy();
  });

  it('shows the size limit as the default hint', () => {
    render(<Files />);
    expect(screen.getByText('Up to 5 MB.')).toBeTruthy();
  });
});
