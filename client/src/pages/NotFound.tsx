import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container py-32 text-center">
      <h1 className="text-7xl mb-4">404</h1>
      <p className="text-muted mb-8">This page slipped behind the sofa.</p>
      <Link to="/" className="btn btn-primary">Back home</Link>
    </div>
  );
}
