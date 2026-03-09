import React, { useRef } from 'react';

/**
 * CMS image upload component that converts files to base64 data URLs.
 * Props:
 *   label: string
 *   value: string (current data URL or empty)
 *   onChange: (dataUrl: string) => void
 *   hint: string (size recommendation)
 *   accept: string (default: '.png,.jpg,.jpeg')
 *   maxSizeMB: number (default: 2)
 */
const CmsImageUpload = ({ label, value, onChange, hint, accept = '.png,.jpg,.jpeg', maxSizeMB = 2 }) => {
    const inputRef = useRef(null);

    const handleFile = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate type
        const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            alert('Format file tidak didukung. Gunakan PNG, JPG, atau JPEG.');
            return;
        }

        // Validate size
        const maxBytes = maxSizeMB * 1024 * 1024;
        if (file.size > maxBytes) {
            alert(`Ukuran file melebihi batas maksimal ${maxSizeMB}MB.`);
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            onChange(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleRemove = () => {
        onChange('');
        if (inputRef.current) inputRef.current.value = '';
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">{label}</label>

            {/* Preview */}
            {value && (
                <div className="relative inline-block rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                    <img src={value} alt="Preview" className="max-h-32 w-auto object-contain" />
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow transition-colors"
                        title="Hapus gambar"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Upload Button */}
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                    <span className="material-symbols-outlined text-lg">upload</span>
                    {value ? 'Ganti Gambar' : 'Upload Gambar'}
                </button>
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    onChange={handleFile}
                    className="hidden"
                />
            </div>

            {/* Hint */}
            {hint && <p className="text-xs text-slate-400">{hint}</p>}
        </div>
    );
};

export default CmsImageUpload;
