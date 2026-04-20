import { useState } from "react";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  DragOverlay,
  MouseSensor,
  TouchSensor,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { toast } from "react-toastify";
import { useProjects } from "../../context/ProjectsContext";
import KanbanColumn from "./KanbanColumn";
import TaskCard from "./TaskCard";
import TaskModal from "./TaskModal";
import Modal from "../common/Modal";
import Input from "../common/Input";
import Button from "../common/Button";
import { useForm } from "react-hook-form";
import { TASK_STATUS, STATUS_LABELS } from "../../utils/constants";

const COLUMNS = [
  { id: TASK_STATUS.TODO, title: STATUS_LABELS.todo },
  { id: TASK_STATUS.IN_PROGRESS, title: STATUS_LABELS.in_progress },
  { id: TASK_STATUS.DONE, title: STATUS_LABELS.done },
];

export default function KanbanBoard({ projectId }) {
  const { tasks, createTask, updateTask } = useProjects();
  const [activeTask, setActiveTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [addingToColumn, setAddingToColumn] = useState(null);
  const [creating, setCreating] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 180, // 👈 MUST HAVE
        tolerance: 6,
      },
    }),
  );

  const getColumnTasks = (status) =>
    tasks
      .filter((t) => t.project_id === projectId && t.status === status)
      .sort((a, b) => a.position - b.position);

  const handleDragStart = ({ active }) => {
    setActiveTask(tasks.find((t) => t.id === active.id) || null);
  };

  const handleDragEnd = async ({ active, over }) => {
    setActiveTask(null);
    if (!over) return;

    const task = tasks.find((t) => t.id === active.id);
    if (!task) return;

    const newStatus = COLUMNS.find((c) => c.id === over.id)?.id || task.status;

    if (newStatus !== task.status) {
      try {
        await updateTask(task.id, { status: newStatus });
        toast.success(`Task moved to ${STATUS_LABELS[newStatus]}`);
      } catch {
        toast.error("Failed to move task");
      }
    }
  };

  const handleAddTask = (columnId) => {
    setAddingToColumn(columnId);
  };

  const onCreateTask = async ({ title, priority, due_date }) => {
    setCreating(true);
    try {
      const columnTasks = getColumnTasks(addingToColumn);
      await createTask({
        title,
        priority: priority || "medium",
        due_date: due_date || null,
        status: addingToColumn,
        project_id: projectId,
        position: columnTasks.length,
      });
      toast.success("Task created!");
      reset();
      setAddingToColumn(null);
    } catch {
      toast.error("Failed to create task");
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 px-2 snap-x snap-mandatory md:snap-none">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              id={col.id}
              title={col.title}
              tasks={getColumnTasks(col.id)}
              onTaskClick={(task) => {
                setSelectedTask(task);
                setShowTaskModal(true);
              }}
              onAddTask={handleAddTask}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask && <TaskCard task={activeTask} />}
        </DragOverlay>
      </DndContext>

      <TaskModal
        task={selectedTask}
        isOpen={showTaskModal}
        onClose={() => {
          setShowTaskModal(false);
          setSelectedTask(null);
        }}
      />

      <Modal
        isOpen={!!addingToColumn}
        onClose={() => setAddingToColumn(null)}
        title={`Add task to ${STATUS_LABELS[addingToColumn] || ""}`}
        size="sm"
      >
        <form
          onSubmit={handleSubmit(onCreateTask)}
          className="flex flex-col gap-3"
        >
          <Input
            label="Task title"
            placeholder="What needs to be done?"
            error={errors.title?.message}
            {...register("title", { required: "Title is required" })}
          />
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Priority
            </label>
            <select
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register("priority")}
              defaultValue="medium"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <Input
            label="Due date (optional)"
            type="date"
            {...register("due_date")}
          />
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAddingToColumn(null)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={creating}>
              Add task
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
