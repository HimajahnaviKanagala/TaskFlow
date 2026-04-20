import { Link } from "react-router-dom";
import Button from "../components/common/Button";

export default function Landing() {
  return (
    <div
      className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 
dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 transition-colors"
    >
      <div className="max-w-lg text-center">
        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="text-white text-2xl font-bold">TF</span>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
          TaskFlow
        </h1>

        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          A simple, powerful project management tool. Organize projects, manage
          tasks with a Kanban board, track progress.
        </p>

        <div className="flex gap-3 justify-center">
          <Link to="/register">
            <Button size="lg">Get started free</Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="outline">
              Sign in
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
