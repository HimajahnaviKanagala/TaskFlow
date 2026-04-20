import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useAuth } from "../context/AuthContext";
import { useProjects } from "../context/ProjectsContext";

const COLORS = ["#3B82F6", "#F59E0B", "#10B981"];

export default function Dashboard() {
  const { user } = useAuth();
  const { projects, tasks, fetchProjects } = useProjects();

  useEffect(() => {
    if (user) fetchProjects(user.id);
  }, [user]);

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === "done").length;
  const overdueTasks = tasks.filter((t) => {
    if (!t.due_date) return false;
    return new Date(t.due_date) < new Date() && t.status !== "done";
  }).length;

  const progressData = projects.slice(0, 6).map((p) => {
    const projectTasks = tasks.filter((t) => t.project_id === p.id);
    const done = projectTasks.filter((t) => t.status === "done").length;
    return {
      name: p.name.slice(0, 12),
      total: projectTasks.length,
      done,
    };
  });

  const priorityData = [
    { name: "Low", value: tasks.filter((t) => t.priority === "low").length },
    {
      name: "Medium",
      value: tasks.filter((t) => t.priority === "medium").length,
    },
    { name: "High", value: tasks.filter((t) => t.priority === "high").length },
  ].filter((d) => d.value > 0);

  const name = user?.user_metadata?.full_name || "there";

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Welcome, {name} 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Here's your project overview
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Total projects",
            value: projects.length,
            color: "text-blue-600",
          },
          { label: "Total tasks", value: totalTasks, color: "text-gray-500" },
          { label: "Completed", value: doneTasks, color: "text-green-600" },
          { label: "Overdue", value: overdueTasks, color: "text-red-500" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
          >
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              {label}
            </p>
            <p className={`text-2xl font-semibold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Tasks per project
          </h2>
          {progressData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={progressData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="total" fill="#DBEAFE" name="Total" />
                <Bar dataKey="done" fill="#3B82F6" name="Done" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
              No data yet — create some projects
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Task priority breakdown
          </h2>
          {priorityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  dataKey="value"
                  label
                >
                  {priorityData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
              No tasks yet
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Recent projects
          </h2>
          <Link
            to="/projects"
            className="text-xs text-blue-600 hover:underline"
          >
            View all
          </Link>
        </div>
        {projects.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">No projects yet</p>
            <Link
              to="/projects"
              className="text-blue-600 text-sm mt-2 inline-block hover:underline"
            >
              Create your first project
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {projects.slice(0, 6).map((p) => (
              <Link key={p.id} to={`/projects/${p.id}`}>
                <div className="border border-gray-50 rounded-lg p-3 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-gray-900 transition-all">
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ background: p.color }}
                    />
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                      {p.name}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {p.description || "No description"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
