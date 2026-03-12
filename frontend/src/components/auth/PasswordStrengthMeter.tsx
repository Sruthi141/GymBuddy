import { getPasswordStrength } from '../../utils/validation';

interface PasswordStrengthMeterProps {
    password: string;
}

const labels = ['Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
const colors = ['bg-danger', 'bg-amber-500', 'bg-yellow-500', 'bg-secondary', 'bg-primary'];

export default function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
    const strength = getPasswordStrength(password);
    if (!password) return null;

    return (
        <div className="mt-1.5">
            <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                            i < strength ? colors[strength - 1] : 'bg-dark-600'
                        }`}
                    />
                ))}
            </div>
            <p className="text-xs text-dark-400 mt-1">
                {labels[strength - 1]}
            </p>
        </div>
    );
}
