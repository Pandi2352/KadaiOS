import { UploadSimpleIcon } from '@phosphor-icons/react';
import { type ChangeEvent, type DragEvent, useState } from 'react';
import { cn } from '../../../cn';
import { fieldClass } from '../fieldStyles';
import { type FieldProps, FormField } from '../FormField';
import { FileListItem } from './FileListItem';
import { DEFAULT_MAX_FILE_SIZE, formatBytes, pickFiles } from './fileValue';

interface FileFieldProps extends Omit<FieldProps<File[]>, 'onBlur'> {
  /** The same format as the file input's accept, such as "image/*,.pdf". Also checked for dropped files. */
  accept?: string;
  multiple?: boolean;
  /** The largest size of each file, in bytes. Defaults to 5 MB. */
  maxSize?: number;
  maxFiles?: number;
}

/**
 * Choose or drop files, with previews. It only collects them: the form sends them when it submits.
 * There's no onBlur check, because opening the file picker counts as leaving the field.
 */
export function FileField({
  label,
  value,
  onChange,
  error,
  hint,
  required,
  disabled,
  accept,
  multiple = false,
  maxSize = DEFAULT_MAX_FILE_SIZE,
  maxFiles,
}: FileFieldProps) {
  const [rejection, setRejection] = useState<string>();
  const [isDragging, setDragging] = useState(false);
  const message = error ?? rejection;

  const addFiles = (incoming: File[]) => {
    const result = pickFiles(value, incoming, { accept, multiple, maxSize, maxFiles });
    setRejection(result.rejection);
    onChange(result.files);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(event.target.files ?? []));
    // Otherwise choosing the same file again after removing it does nothing.
    event.target.value = '';
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(false);
    if (!disabled) addFiles(Array.from(event.dataTransfer.files));
  };

  const handleDragOver = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    if (!disabled) setDragging(true);
  };

  return (
    <FormField
      label={label}
      error={message}
      hint={hint ?? `Up to ${formatBytes(maxSize)}${multiple ? ' each' : ''}.`}
      required={required}
    >
      {(control) => (
        <div className="space-y-2">
          <input
            {...control}
            type="file"
            accept={accept}
            multiple={multiple}
            disabled={disabled}
            onChange={handleChange}
            className="peer sr-only outline-none"
          />
          <label
            htmlFor={control.id}
            onDragOver={handleDragOver}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={fieldClass(
              Boolean(message),
              cn(
                'flex min-h-20 flex-col items-center justify-center gap-1 border-dashed py-3 text-center peer-focus-visible:border-brand',
                disabled ? 'cursor-not-allowed border-line bg-hover text-muted' : 'cursor-pointer hover:bg-hover',
                isDragging && 'border-brand bg-brand-soft',
              ),
            )}
          >
            <UploadSimpleIcon size={22} aria-hidden className="text-brand" />
            <span>
              <span className="font-medium text-brand">Choose {multiple ? 'files' : 'a file'}</span> or drag{' '}
              {multiple ? 'them' : 'it'} here
            </span>
          </label>
          {value.length > 0 && (
            <ul aria-label="Chosen files" className="space-y-2">
              {value.map((file, index) => (
                <FileListItem
                  key={`${file.name}-${file.size}-${file.lastModified}`}
                  file={file}
                  disabled={disabled}
                  onRemove={() => onChange(value.filter((_, position) => position !== index))}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </FormField>
  );
}
