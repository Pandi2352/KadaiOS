import { FileIcon, XIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { FieldAction } from '../FieldAction';
import { formatBytes } from './fileValue';

function ImagePreview({ file }: { file: File }) {
  // A preview URL holds the file in memory, so it's released when the image goes away.
  const attachPreview = useCallback(
    (image: HTMLImageElement | null) => {
      if (!image) return;
      const url = URL.createObjectURL(file);
      image.src = url;
      return () => URL.revokeObjectURL(url);
    },
    [file],
  );

  return <img ref={attachPreview} alt="" className="size-9 shrink-0 rounded-md object-cover" />;
}

interface FileListItemProps {
  file: File;
  disabled?: boolean;
  onRemove: () => void;
}

export function FileListItem({ file, disabled, onRemove }: FileListItemProps) {
  return (
    <li className="flex items-center gap-2 rounded-md border border-line bg-surface p-2">
      {file.type.startsWith('image/') ? (
        <ImagePreview file={file} />
      ) : (
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-brand-soft text-brand">
          <FileIcon size={20} aria-hidden />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{file.name}</span>
        <span className="block text-xs text-muted">{formatBytes(file.size)}</span>
      </span>
      <FieldAction icon={XIcon} label={`Remove ${file.name}`} disabled={disabled} onClick={onRemove} />
    </li>
  );
}
