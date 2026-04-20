import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { useProjects } from "../context/ProjectsContext";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Modal from "../components/common/Modal";
import { PROJECT_COLORS } from "../utils/constants";

export default function Projects() {
  const { user } = useAuth();
  const { projects, loading, fetchProjects, createProject, deleteProject } =
    useProjects();
  const [showModal, setShowModal] = useState(false);
  const [selectedColor, setSelectedColor] = useState(PROJECT_COLORS[0]);
  const [creating, setCreating] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (user) fetchProjects(user.id);
  }, [user]);

  const onSubmit = async ({ name, description }) => {
    setCreating(true);
    try {
      await createProject({
        name,
        description,
        color: selectedColor,
        user_id: user.id,
      });
      toast.success("Project created!");
      reset();
      setShowModal(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.preventDefault();
    if (!confirm("Delete this project and all its tasks?")) return;
    try {
      await deleteProject(id);
      toast.success("Project deleted");
    } catch {
      toast.error("Failed to delete project");
    }
  };

  return (
    <div className="max-w-4xl mx-auto text-gray-900 dark:text-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Projects
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>+ New project</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <p className="text-gray-400 dark:text-gray-500 text-lg mb-2">
            No projects yet
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mb-4">
            Create your first project to get started
          </p>
          <Button onClick={() => setShowModal(true)}>Create project</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link key={project.id} to={`/projects/${project.id}`}>
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-500 transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full shrink-0"
                      style={{ background: project.color }}
                    />
                    <h3 className="font-medium text-gray-800 dark:text-gray-100 group-hover:text-blue-600 transition">
                      {project.name}
                    </h3>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, project.id)}
                    className="text-gray-500 hover:text-red-500 transition opacity-0 group-hover:opacity-100 text-lg leading-none"
                  >
                    x
                  </button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                  {project.description || "No description"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="New project"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Project name"
            placeholder="e.g. Website Redesign"
            error={errors.name?.message}
            {...register("name", { required: "Project name is required" })}
          />
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Description
            </label>
            <textarea
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="What is this project about?"
              {...register("description")}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {PROJECT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-7 h-7 rounded-full transition-all ${selectedColor === color ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : ""}`}
                  style={{ background: color }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2 justify-end mt-2">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={creating}>
              Create
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
