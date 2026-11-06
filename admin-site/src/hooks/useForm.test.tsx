import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FormAlert } from '@/components/ui/form/FormAlert';
import { TextField } from '@/components/ui/form/TextField';
import { ApiError } from '@/lib/api/ApiError';
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

  it('tracks unsaved changes', async () => {
    render(<TestForm onSubmit={vi.fn()} />);
    expect(screen.getByText('clean')).toBeTruthy();
    await userEvent.type(screen.getByRole('textbox', { name: 'Name' }), 'x');
    expect(screen.getByText('dirty')).toBeTruthy();
    await userEvent.clear(screen.getByRole('textbox', { name: 'Name' }));
    expect(screen.getByText('clean')).toBeTruthy();
  });
});
