import { useRef, useState, useEffect, KeyboardEvent } from 'react';

interface OTPInputProps {
    length?: number;
    value: string;
    onChange: (otp: string) => void;
    disabled?: boolean;
    error?: string;
}

export default function OTPInput({ length = 6, value, onChange, disabled, error }: OTPInputProps) {
    const [digits, setDigits] = useState<string[]>(() =>
        value.split('').concat(Array(length - value.length).fill(''))
    );
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        const arr = value.split('').slice(0, length);
        setDigits(arr.concat(Array(length - arr.length).fill('')));
    }, [value, length]);

    const handleChange = (index: number, val: string) => {
        const char = val.replace(/\D/g, '').slice(-1);
        const next = [...digits];
        next[index] = char;
        setDigits(next);
        onChange(next.join(''));
        if (char && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !digits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
        const arr = pasted.split('').concat(Array(length - pasted.length).fill(''));
        setDigits(arr);
        onChange(arr.join(''));
        const focusIdx = Math.min(pasted.length, length - 1);
        inputRefs.current[focusIdx]?.focus();
    };

    return (
        <div>
            <div className="flex gap-2 justify-center">
                {digits.map((d, i) => (
                    <input
                        key={i}
                        ref={(el) => { inputRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={d}
                        onChange={(e) => handleChange(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        onPaste={handlePaste}
                        disabled={disabled}
                        className={`w-12 h-14 text-center text-xl font-bold rounded-xl bg-dark-800 border-2
                            ${error ? 'border-danger' : 'border-dark-600 focus:border-primary'}
                            focus:outline-none focus:ring-2 focus:ring-primary/30
                            disabled:opacity-50 transition-colors`}
                    />
                ))}
            </div>
            {error && <p className="mt-2 text-sm text-danger text-center">{error}</p>}
        </div>
    );
}
