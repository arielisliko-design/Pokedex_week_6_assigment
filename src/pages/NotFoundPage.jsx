import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="status">
      <p style={{ fontSize: 40, marginBottom: 8 }}>🔍</p>
      <p>There's nothing here.</p>
      <Link to="/" className="back-link">← Back to list</Link>
    </div>
  );
}

export default NotFoundPage;
