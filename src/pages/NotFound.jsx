import { Link } from "react-router-dom";
import Button from "../components/common/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
      <div className="text-center">
        <p className="text-6xl font-bold text-gray-300 mb-2">404</p>
        <h1 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Page not found
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          The page you're looking for doesn't exist.
        </p>
        <Link to="/dashboard">
          <Button>Back to dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
