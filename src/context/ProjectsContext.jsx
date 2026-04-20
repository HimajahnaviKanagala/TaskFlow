import { createContext, useCallback, useContext, useState } from "react";
import { projectsApi } from "../services/projectsApi";
import { tasksApi } from "../services/tasksApi";

const ProjectsContext = createContext();

export function ProjectsProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchProjects = useCallback(async (userId) => {
    setLoading(true);
    try {
      const data = await projectsApi.getAll(userId);
      setProjects(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const createProject = async (project) => {
    const newProject = await projectsApi.create(project);
    setProjects((prev) => [newProject, ...prev]);
    return newProject;
  };

  const updateProject = async (id, updates) => {
    const updated = await projectsApi.update(id, updates);
    setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  };

  const deleteProject = async (id) => {
    await projectsApi.delete(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const fetchTasks = useCallback(async (projectId) => {
    setLoading(true);
    try {
      const data = await tasksApi.getByProject(projectId);
      setTasks(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = async (task) => {
    const newTask = await tasksApi.create(task);
    setTasks((prev) => [...prev, newTask]);
    return newTask;
  };

  const updateTask = async (id, updates) => {
    const updated = await tasksApi.update(id, updates);
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    return updated;
  };

  const deleteTask = async (id) => {
    await tasksApi.delete(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ProjectsContext.Provider
      value={{
        projects,
        tasks,
        loading,
        fetchProjects,
        createProject,
        updateProject,
        deleteProject,
        fetchTasks,
        createTask,
        updateTask,
        deleteTask,
      }}
    >
      {children}
    </ProjectsContext.Provider>
  );
}

export const useProjects = () => {
  const ctx = useContext(ProjectsContext);
  if (!ctx) throw new Error("useProjects must be used inside ProjectsProvider");
  return ctx;
};
