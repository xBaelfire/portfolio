import { useCallback, useRef, useState } from 'react';
import { Image, Link, Upload, X } from 'lucide-react';
import { uploadImage } from '@/lib/api';

type InputMode = 'file' | 'url';

interface ImageUploaderProps {
  readonly value: string;
  readonly onChange: (url: string) => void;
  readonly label?: string;
}

const ACCEPTED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]);

const ACCEPTED_EXTENSIONS = '.jpeg,.jpg,.png,.webp,.gif,.svg';
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

function validateFile(file: File): string | null {
  if (!ACCEPTED_TYPES.has(file.type)) {
    return 'Invalid file type. Accepted: JPEG, PNG, WebP, GIF, SVG.';
  }
  if (file.size > MAX_SIZE_BYTES) {
    return 'File exceeds the 5 MB size limit.';
  }
  return null;
}

export function ImageUploader({ value, onChange, label }: ImageUploaderProps) {
  const [mode, setMode] = useState<InputMode>('file');
  const [urlInput, setUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setError(null);
      setUploading(true);

      try {
        const result = await uploadImage(file);
        onChange(result.url);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Upload failed. Please try again.';
        setError(message);
      } finally {
        setUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [onChange],
  );

  const handleUrlSubmit = useCallback(() => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setError('Please enter a URL.');
      return;
    }

    try {
      new URL(trimmed);
    } catch {
      setError('Please enter a valid URL.');
      return;
    }

    setError(null);
    onChange(trimmed);
    setUrlInput('');
  }, [urlInput, onChange]);

  const handleClear = useCallback(() => {
    onChange('');
    setError(null);
    setUrlInput('');
  }, [onChange]);

  const switchMode = useCallback(
    (next: InputMode) => {
      if (next !== mode) {
        setMode(next);
        setError(null);
        setUrlInput('');
      }
    },
    [mode],
  );

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-medium text-white/70">{label}</label>
      )}

      {/* Mode toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => switchMode('file')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg
            border transition-colors ${
              mode === 'file'
                ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                : 'bg-white/5 border-white/10 text-white/50 hover:text-white/70'
            }`}
        >
          <Upload className="w-3.5 h-3.5" />
          Upload File
        </button>
        <button
          type="button"
          onClick={() => switchMode('url')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg
            border transition-colors ${
              mode === 'url'
                ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                : 'bg-white/5 border-white/10 text-white/50 hover:text-white/70'
            }`}
        >
          <Link className="w-3.5 h-3.5" />
          Paste URL
        </button>
      </div>

      {/* File upload mode */}
      {mode === 'file' && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_EXTENSIONS}
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full flex items-center justify-center gap-2 px-4 py-6
              rounded-xl border border-dashed border-white/10 bg-white/5
              text-white/50 hover:text-white/70 hover:border-indigo-500/30
              hover:bg-indigo-500/5 transition-colors disabled:opacity-50
              disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span className="text-sm">Click to browse for an image</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* URL paste mode */}
      {mode === 'url' && (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleUrlSubmit();
            }}
            placeholder="https://example.com/image.png"
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-white/10
              bg-white/5 text-white placeholder-white/30
              focus:outline-none focus:border-indigo-500/40 focus:ring-1
              focus:ring-indigo-500/20 transition-colors"
          />
          <button
            type="button"
            onClick={handleUrlSubmit}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-indigo-500/20
              border border-indigo-500/40 text-indigo-300
              hover:bg-indigo-500/30 transition-colors"
          >
            Set
          </button>
        </div>
      )}

      {/* Error message */}
      {error && <p className="text-xs text-red-400">{error}</p>}

      {/* Preview thumbnail */}
      {value && (
        <div className="relative inline-block group">
          <div
            className="w-24 h-24 rounded-lg border border-white/10 bg-white/5
              overflow-hidden flex items-center justify-center"
          >
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden flex-col items-center gap-1 text-white/30">
              <Image className="w-6 h-6" />
              <span className="text-[10px]">Failed</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500/80
              text-white opacity-0 group-hover:opacity-100 transition-opacity
              hover:bg-red-500"
            aria-label="Remove image"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}
