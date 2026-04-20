import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useProjects } from "../context/ProjectsContext";
import KanbanBoard from "../components/kanban/KanbanBoard";
import Loader from "../components/common/Loader";

export default function ProjectBoard() {
  const { id } = useParams();
  const { projects, tasks, loading, fetchTasks } = useProjects();

  useEffect(() => {
    fetchTasks(id);
  }, [id]);

  const project = projects.find((p) => p.id === id);

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Link
          to="/projects"
          className="text-sm text-gray-400 dark:text-gray-500 hover:text-blue-600 transition"
        >
          Projects
        </Link>
        <span className="text-gray-300 dark:text-gray-600">/</span>
        <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
          {project?.name || "Project"}
        </span>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-4 h-4 rounded-full shrink-0"
          style={{ background: project?.color || "#3B82F6" }}
        />
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          {project?.name || "Project"}
        </h1>
        {project?.description && (
          <span className="text-sm text-gray-400 dark:text-gray-500">
            {project.description}
          </span>
        )}
      </div>

      <KanbanBoard projectId={id} />
    </div>
  );
}
