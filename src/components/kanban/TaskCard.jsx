import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Badge from "../common/Badge";
import { formatDate, isOverdue } from "../../utils/helpers";
import { PRIORITY_COLORS } from "../../utils/constants";

const priorityBadgeColor = { low: "green", medium: "yellow", high: "red" };

export default function TaskCard({ task, onClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const overdue = isOverdue(task.due_date) && task.status !== "done";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 border rounded-lg p-3 md:p-3.5 cursor-grab active:cursor-grabbing touch-none shadow-sm hover:shadow-md transition-all break-words
  ${
    overdue
      ? "border-red-200 dark:border-red-400"
      : "border-gray-200 dark:border-gray-700"
  }`}
    >
      <p className="text-sm md:text-[15px] font-medium text-gray-800 dark:text-gray-100 mb-2 leading-snug break-words">
        {task.title}
      </p>
      {task.description && (
        <p className="text-xs md:text-sm text-gray-400 dark:text-gray-500 mb-2 line-clamp-2 break-words">
          {task.description}
        </p>
      )}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <Badge color={priorityBadgeColor[task.priority]}>{task.priority}</Badge>
        {task.due_date && (
          <span
            className={`text-xs ${overdue ? "text-red-500 font-medium" : "text-gray-400 dark:text-gray-500"}`}
          >
            {overdue ? "⚠ " : ""}
            {formatDate(task.due_date)}
          </span>
        )}
      </div>
    </div>
  );
}
