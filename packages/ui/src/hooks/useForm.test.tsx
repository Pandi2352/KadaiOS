import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FormAlert } from '../components/form/FormAlert';
import { TextField } from '../components/form/TextField';
import { fieldRules } from '../components/form/validation/fieldRules';
import { ApiError } from '../api/ApiError';
import { useForm } from './useForm';

function TestForm({ onSubmit }: { onSubmit: (values: { name: string }) => Promise<void> }) {
  const { field, handleSubmit, formError, isDirty } = useForm({ initialValues: { name: '' }, onSubmit });
  return (
    <form onSubmit={handleSubmit}>
      <FormAlert message={formError} />
      <TextField {...field('name')} label="Name" required />
      <p>{isDirty ? 'dirty' : 'clean'}</p>
      <button type="submit">Save</button>
    </form>
  );
}

const save = () => userEvent.click(screen.getByRole('button', { name: 'Save' }));

describe('useForm', () => {
  it('submits the current values', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<TestForm onSubmit={onSubmit} />);
    await userEvent.type(screen.getByRole('textbox', { name: 'Name' }), 'Corner');
    await save();
    expect(onSubmit).toHaveBeenCalledWith({ name: 'Corner' });
  });

  it('shows API field errors under the field and links them for screen readers', async () => {
    const error = new ApiError({
      statusCode: 400,
      message: ['Name is required'],
      fields: { name: ['Name is required'] },
    });
    render(<TestForm onSubmit={vi.fn().mockRejectedValue(error)} />);
    await save();

    const input = screen.getByRole('textbox', { name: 'Name' });
    const message = screen.getByText('Name is required');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toContain(message.id);
  });

  it('clears a field error when the field changes', async () => {
    const error = new ApiError({ statusCode: 400, message: ['Bad'], fields: { name: ['Bad'] } });
    render(<TestForm onSubmit={vi.fn().mockRejectedValue(error)} />);
    await save();
    await userEvent.type(screen.getByRole('textbox', { name: 'Name' }), 'x');
    expect(screen.queryByText('Bad')).toBeNull();
  });

  it('shows other failures in the form alert', async () => {
    const error = new ApiError({ statusCode: 0, message: "Can't reach the server" });
    render(<TestForm onSubmit={vi.fn().mockRejectedValue(error)} />);
    await save();
    expect(screen.getByRole('alert').textContent).toBe("Can't reach the server");
  });

  it('shows a field error for an unknown field in the form alert, so it is never lost', async () => {
    const error = new ApiError({ statusCode: 400, message: ['Bad id'], fields: { other: ['Bad id'] } });
    render(<TestForm onSubmit={vi.fn().mockRejectedValue(error)} />);
    await save();
    expect(screen.getByRole('alert').textContent).toBe('Bad id');
  });

  describe('with rules', () => {
    const name = () => screen.getByRole('textbox', { name: 'Name' });

    function RulesForm({ onSubmit }: { onSubmit: (values: { name: string; phone: string }) => Promise<void> }) {
      const { field, handleSubmit } = useForm({
        initialValues: { name: '', phone: '' },
        rules: { name: fieldRules.text('Name', { required: true }), phone: fieldRules.phone() },
        onSubmit,
      });
      return (
        <form noValidate onSubmit={handleSubmit}>
          <TextField {...field('name')} label="Name" />
          <TextField {...field('phone')} label="Phone" />
          <button type="button">Cancel</button>
          <button type="submit">Save</button>
        </form>
      );
    }

    it('does not call the API while a field is invalid, and focuses the first problem', async () => {
      const onSubmit = vi.fn();
      render(<RulesForm onSubmit={onSubmit} />);
      await save();

      expect(onSubmit).not.toHaveBeenCalled();
      expect(screen.getByText('Name is required')).toBeTruthy();
      expect(document.activeElement).toBe(name());
    });

    it('shows required from the rules', () => {
      render(<RulesForm onSubmit={vi.fn()} />);
      expect(name().getAttribute('aria-required')).toBe('true');
      expect(screen.getByLabelText('Phone (optional)')).toBeTruthy();
    });

    it('checks a field when leaving it', async () => {
      render(<RulesForm onSubmit={vi.fn()} />);
      await userEvent.click(name());
      await userEvent.tab();
      expect(screen.getByText('Name is required')).toBeTruthy();
    });

    it('does not show an error when leaving a field to click a button', async () => {
      render(<RulesForm onSubmit={vi.fn()} />);
      await userEvent.click(name());
      await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(screen.queryByText('Name is required')).toBeNull();
    });

    it('removes the error as soon as it is fixed', async () => {
      render(<RulesForm onSubmit={vi.fn()} />);
      const phone = screen.getByRole('textbox', { name: /Phone/ });
      await userEvent.type(phone, '12');
      await userEvent.click(name());
      expect(screen.getByText('Phone must have 10 to 15 digits')).toBeTruthy();

      await userEvent.clear(phone);
      expect(screen.queryByText('Phone must have 10 to 15 digits')).toBeNull();
    });

    it('submits once everything is valid', async () => {
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      render(<RulesForm onSubmit={onSubmit} />);
      await userEvent.type(name(), 'Kavi');
      await save();
      expect(onSubmit).toHaveBeenCalledWith({ name: 'Kavi', phone: '' });
    });
  });

  it('tracks unsaved changes', async () => {
    render(<TestForm onSubmit={vi.fn()} />);
    expect(screen.getByText('clean')).toBeTruthy();
    await userEvent.type(screen.getByRole('textbox', { name: 'Name' }), 'x');
    expect(screen.getByText('dirty')).toBeTruthy();
    await userEvent.clear(screen.getByRole('textbox', { name: 'Name' }));
    expect(screen.getByText('clean')).toBeTruthy();
  });
});
