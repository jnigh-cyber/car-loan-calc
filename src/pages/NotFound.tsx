import { Link } from 'react-router-dom';

function NotFoundPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper p-8 text-center">
            <h1 className="font-display text-6xl text-ink">404</h1>
            <p className="font-body text-lg text-muted">
                This page doesn't exist.
            </p>
            <Link
                to="/"
                className="border-2 border-ink px-6 py-2 font-body text-sm font-semibold uppercase tracking-wide text-ink transition-colors hover:bg-ink hover:text-paper"
            >
                Back to Calculator
            </Link>
        </div>
    );
}

export default NotFoundPage;