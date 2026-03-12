import { Link } from 'react-router-dom';
import { Dumbbell, ArrowLeftCircle } from 'lucide-react';
import PageBackground from '../layouts/PageBackground';

export default function NotFoundPage() {
  return (
    <PageBackground image="https://images.unsplash.com/photo-1517838355540-7e0c8ed2963c?w=1600&q=80&auto=format">
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4">
          <Dumbbell className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-black text-white mb-2">404</h1>
        <p className="text-sm text-dark-300 mb-6">The page you’re looking for has racked somewhere else.</p>
        <Link
          to="/"
          className="btn-primary inline-flex items-center gap-2 text-sm py-2.5 px-5"
        >
          <ArrowLeftCircle className="w-4 h-4" />
          Back to GymBuddy Home
        </Link>
      </div>
    </PageBackground>
  );
}

