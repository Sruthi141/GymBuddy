import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ message = 'Loading...' }: { message?: string }) => {
    return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-dark-600" />
                <Loader2 className="w-12 h-12 animate-spin text-primary absolute inset-0" />
            </div>
            <p className="text-sm text-dark-300">{message}</p>
        </div>
    );
};

export default LoadingSpinner;
