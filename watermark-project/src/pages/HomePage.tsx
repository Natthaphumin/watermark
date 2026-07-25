import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <div className="page">
      <h1>Watermark your photos in the browser</h1>
      <p>
        Upload a photo, add a text and/or logo watermark, drag it into place, and download the
        result. No account needed.
      </p>
      <p>
        <Link to="/editor">Open the editor →</Link>
      </p>
    </div>
  );
}
