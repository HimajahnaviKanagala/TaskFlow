import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import TaskCard from "./TaskCard";

const columnColors = {
  todo: "bg-gray-100 dark:bg-gray-600",
  in_progress: "bg-blue-50 dark:bg-blue-900/30",
  done: "bg-green-50 dark:bg-green-900/30",
};

const columnTitleColors = {
  todo: "text-gray-600 dark:text-gray-300",
  in_progress: "text-blue-600 dark:text-blue-300",
  done: "text-green-600 dark:text-green-300",
};

export default function KanbanColumn({
  id,
  title,
  tasks,
  onTaskClick,
  onAddTask,
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      className={`
    flex flex-col rounded-xl p-3 min-h-[60vh]
    w-[85%] sm:w-80 md:w-72
    shrink-0 snap-start
    transition-all
    ${columnColors[id]}
    ${isOver ? "ring-2 ring-blue-300 dark:ring-blue-500" : ""}
  `}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className={`text-sm font-semibold ${columnTitleColors[id]}`}>
            {title}
          </h3>
          <span className="bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-500 text-xs font-medium px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask(id)}
          className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 transition text-lg leading-none"
        >
          +
        </button>
      </div>

      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div ref={setNodeRef} className="flex flex-col gap-2 flex-1">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task)}
            />
          ))}
          {tasks.length === 0 && (
            <div className="flex-1 flex items-center justify-center text-xs text-gray-300 dark:text-gray-500 dark:border-gray-700 border-2 border-dashed border-gray-200 rounded-lg py-6">
              Drop tasks here
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
