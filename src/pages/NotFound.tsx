import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center gap-5 px-6 text-center">
      <p className="eyebrow">404</p>
      <h1 className="display-lg">This page isn&apos;t on our tree.</h1>
      <p className="body-copy max-w-md">
        The page you&apos;re looking for doesn&apos;t exist — but every Apple product does, at REDAPPLEKE.
      </p>
      <Link to="/" className="btn-pill btn-primary">
        Back to Home
      </Link>
    </main>
  );
}
