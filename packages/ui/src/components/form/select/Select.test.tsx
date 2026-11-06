import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Select, type SelectOption } from './Select';

const OPTIONS: SelectOption[] = [
  { value: 'meat', label: 'Meat shop' },
  { value: 'bakery', label: 'Bakery', disabled: true },
  { value: 'crackers', label: 'Crackers shop' },
  { value: 'dairy', label: 'Dairy shop' },
];

function Harness({
  onChange,
  initial = '',
  ...props
}: {
  onChange?: (value: string) => void;
  initial?: string;
  searchable?: boolean;
  clearable?: boolean;
  disabled?: boolean;
}) {
  const [value, setValue] = useState(initial);
  return (
    <Select
      aria-label="Business type"
      options={OPTIONS}
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
      {...props}
    />
  );
}

const trigger = () => screen.getByRole('combobox', { name: 'Business type' });
const activeOptionText = () => {
  const id = (document.activeElement as HTMLElement).getAttribute('aria-activedescendant');
  return id ? document.getElementById(id)?.textContent : undefined;
};

describe('Select', () => {
  it('never renders a native select', async () => {
    render(<Harness />);
    await userEvent.click(trigger());
    expect(document.querySelector('select')).toBeNull();
  });

  it('shows the placeholder, then the chosen label', async () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    expect(trigger().textContent).toContain('Choose an option');

    await userEvent.click(trigger());
    await userEvent.click(screen.getByRole('option', { name: 'Dairy shop' }));

    expect(onChange).toHaveBeenCalledWith('dairy');
    expect(trigger().textContent).toContain('Dairy shop');
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('marks the selected option', async () => {
    render(<Harness initial="crackers" />);
    await userEvent.click(trigger());
    expect(screen.getByRole('option', { name: 'Crackers shop' }).getAttribute('aria-selected')).toBe('true');
  });

  it('selects with arrow keys and Enter, skipping disabled options', async () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    trigger().focus();

    await userEvent.keyboard('{ArrowDown}');
    expect(activeOptionText()).toBe('Meat shop');
    await userEvent.keyboard('{ArrowDown}');
    expect(activeOptionText()).toBe('Crackers shop');
    await userEvent.keyboard('{Enter}');

    expect(onChange).toHaveBeenCalledWith('crackers');
    expect(document.activeElement).toBe(trigger());
  });

  it('wraps around and supports Home and End', async () => {
    render(<Harness />);
    trigger().focus();
    await userEvent.keyboard('{ArrowDown}{ArrowUp}');
    expect(activeOptionText()).toBe('Dairy shop');
    await userEvent.keyboard('{Home}');
    expect(activeOptionText()).toBe('Meat shop');
    await userEvent.keyboard('{End}');
    expect(activeOptionText()).toBe('Dairy shop');
  });

  it('jumps to an option when its name is typed', async () => {
    render(<Harness />);
    trigger().focus();
    await userEvent.keyboard('{ArrowDown}cr');
    expect(activeOptionText()).toBe('Crackers shop');
  });

  it('opens with a typed letter when closed', async () => {
    render(<Harness />);
    trigger().focus();
    await userEvent.keyboard('d');
    expect(activeOptionText()).toBe('Dairy shop');
  });

  it('closes on Escape without changing the value and returns focus', async () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    trigger().focus();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Escape}');

    expect(screen.queryByRole('listbox')).toBeNull();
    expect(onChange).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(trigger());
  });

  it('ignores clicks on disabled options', async () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    await userEvent.click(trigger());
    await userEvent.click(screen.getByRole('option', { name: 'Bakery' }));

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('listbox')).toBeTruthy();
  });

  it('closes when clicking outside', async () => {
    render(
      <div>
        <Harness />
        <button type="button">Outside</button>
      </div>,
    );
    await userEvent.click(trigger());
    await userEvent.click(screen.getByRole('button', { name: 'Outside' }));
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('does nothing when disabled', async () => {
    render(<Harness disabled />);
    await userEvent.click(trigger());
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  describe('searchable', () => {
    it('filters, keeps keyboard control and shows a no-results message', async () => {
      const onChange = vi.fn();
      render(<Harness searchable onChange={onChange} />);
      await userEvent.click(trigger());

      const search = screen.getByRole('combobox', { name: 'Search options' });
      expect(document.activeElement).toBe(search);

      await userEvent.keyboard('dairy');
      expect(screen.getAllByRole('option')).toHaveLength(1);
      await userEvent.keyboard('{Enter}');
      expect(onChange).toHaveBeenCalledWith('dairy');

      await userEvent.click(trigger());
      await userEvent.keyboard('zzz');
      expect(screen.getByText('Nothing matches your search.')).toBeTruthy();
    });

    it('lets a space be typed into the search box', async () => {
      render(<Harness searchable />);
      await userEvent.click(trigger());
      await userEvent.keyboard('meat shop');
      expect(screen.getAllByRole('option')).toHaveLength(1);
    });
  });

  describe('clearable', () => {
    it('clears the value', async () => {
      const onChange = vi.fn();
      render(<Harness clearable initial="dairy" onChange={onChange} />);
      await userEvent.click(trigger());
      await userEvent.click(screen.getByRole('button', { name: 'Clear selection' }));

      expect(onChange).toHaveBeenCalledWith('');
      expect(trigger().textContent).toContain('Choose an option');
    });

    it('has nothing to clear when empty', async () => {
      render(<Harness clearable />);
      await userEvent.click(trigger());
      expect(screen.queryByRole('button', { name: 'Clear selection' })).toBeNull();
    });
  });
});
