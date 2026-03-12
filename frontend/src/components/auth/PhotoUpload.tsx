import { useRef, useState } from 'react';
import { Camera, X } from 'lucide-react';
import { validatePhoto, PHOTO_ACCEPT } from '../../utils/validation';

interface PhotoUploadProps {
    value: File | null;
    onChange: (file: File | null) => void;
    previewUrl?: string | null;
    label?: string;
    required?: boolean;
    error?: string;
}

export default function PhotoUpload({ value, onChange, previewUrl, label = 'Profile Photo', required, error }: PhotoUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragOver, setDragOver] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    const displayUrl = previewUrl || (value ? URL.createObjectURL(value) : null);

    const handleFile = (file: File | null) => {
        setLocalError(null);
        if (!file) {
            onChange(null);
            return;
        }
        const result = validatePhoto(file);
        if (!result.valid) {
            setLocalError(result.message || 'Invalid file');
            return;
        }
        onChange(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        handleFile(file || null);
    };

    const err = error || localError;

    return (
        <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">{label}{required && ' *'}</label>
            <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`relative w-28 h-28 rounded-2xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-all
                    ${dragOver ? 'border-primary bg-primary/10' : 'border-dark-500 hover:border-primary/50'}
                    ${err ? 'border-danger' : ''}`}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={PHOTO_ACCEPT}
                    onChange={handleChange}
                    className="hidden"
                />
                {displayUrl ? (
                    <>
                        <img src={displayUrl} alt="Preview" className="w-full h-full object-cover rounded-2xl" />
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleFile(null); }}
                            className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-danger flex items-center justify-center hover:bg-danger/80"
                        >
                            <X className="w-4 h-4 text-white" />
                        </button>
                    </>
                ) : (
                    <div className="text-center text-dark-400">
                        <Camera className="w-8 h-8 mx-auto mb-1" />
                        <span className="text-xs">Drop or click</span>
                    </div>
                )}
            </div>
            {err && <p className="mt-1.5 text-sm text-danger">{err}</p>}
        </div>
    );
}
