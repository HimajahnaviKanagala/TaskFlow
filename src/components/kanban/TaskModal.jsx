// import { useEffect, useState } from "react";
// import { useAuth } from "../../context/AuthContext";
// import { useProjects } from "../../context/ProjectsContext";
// import { useForm } from "react-hook-form";
// import { tasksApi } from "../../services/tasksApi";
// import { toast } from "react-toastify";
// import { formatDate } from "../../utils/helpers";
// import Modal from "../common/Modal";
// import Input from "../common/Input";
// import Button from "../common/Button";
// import Badge from "../common/Badge";
// import { generateTaskDescription } from "../../services/aiApi";

// function TaskModal({ task, isOpen, onClose }) {
//   const { user } = useAuth();
//   const { updateTask, deleteTask } = useProjects();
//   const [comments, setComments] = useState([]);
//   const [comment, setComment] = useState("");
//   const [saving, setSaving] = useState(false);
//   const [addingComment, setAddingComment] = useState(false);
//   const [generatingDesc, setGeneratingDesc] = useState(false);

//   const handleGenerateDescription = async () => {
//     const title = document.querySelector('input[name="title"]')?.value;
//     if (!title) {
//       toast.error("Enter a task title first");
//       return;
//     }
//     setGeneratingDesc(true);
//     try {
//       const project = projects?.find(
//         (p) => tasks?.find((t) => t.id === task?.id)?.project_id === p.id,
//       );
//       const desc = await generateTaskDescription(
//         title,
//         project?.name || "the project",
//       );
//       setValue("description", desc);
//       toast.success("Description generated!");
//     } catch {
//       toast.error("Failed to generate description");
//     } finally {
//       setGeneratingDesc(false);
//     }
//   };

//   const {
//     register,
//     handleSubmit,
//     reset,
//     setValue,
//     formState: { errors },
//   } = useForm({
//     defaultValues: {
//       title: task?.title || "",
//       description: task?.description || "",
//       priority: task?.priority || "medium",
//       due_date: task?.due_date || "",
//     },
//   });

//   useEffect(() => {
//     if (task) {
//       reset({
//         title: task.title,
//         description: task.description || "",
//         priority: task.priority,
//         due_date: task.due_date || "",
//       });
//       loadComments();
//     }
//   }, [task]);

//   const loadComments = async () => {
//     try {
//       const data = await tasksApi.getComments(task.id);
//       setComments(data);
//     } catch (error) {
//       console.error("Failed to load comments", error);
//     }
//   };

//   const onSave = async (values) => {
//     setSaving(true);
//     try {
//       await updateTask(task.id, values);
//       toast.success("Task updated");
//       onClose();
//     } catch (error) {
//       toast.error("Failed to update task");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleDelete = async () => {
//     if (!confirm("Delete this task?")) return;
//     try {
//       await deleteTask(task.id);
//       toast.success("Task deleted");
//       onClose();
//     } catch {
//       toast.error("Failed to delete task");
//     }
//   };

//   const handleAddComment = async () => {
//     if (!comment.trim()) return;
//     setAddingComment(true);
//     try {
//       const newComment = await tasksApi.addComment({
//         task_id: task.id,
//         user_id: user.id,
//         content: comment.trim(),
//       });
//       setComments((prev) => [...prev, newComment]);
//       setComment("");
//       toast.success("Comment added");
//     } catch {
//       toast.error("Failed to add comment");
//     } finally {
//       setAddingComment(false);
//     }
//   };

//   const handleDeleteComment = async (commentId) => {
//     try {
//       await tasksApi.deleteComment(commentId);
//       setComments((prev) => prev.filter((c) => c.id !== commentId));
//     } catch {
//       toast.error("Failed to delete comment");
//     }
//   };

//   if (!task) return null;

//   const priorityColors = { low: "green", medium: "yellow", high: "red" };

//   return (
//     <Modal isOpen={isOpen} onClose={onClose} title="Task details" size="xl">
//       <form onSubmit={handleSubmit(onSave)} className="flex flex-col gap-4">
//         <Input
//           label="Title"
//           error={errors.title?.message}
//           {...register("title", { required: "Title is required" })}
//         />
//         <div>
//           <label className="text-sm font-medium text-gray-700 block mb-1">
//             Description
//           </label>
//           <textarea
//             className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             rows={3}
//             placeholder="Task description..."
//             {...register("description")}
//           />
//         </div>
//         <div className="grid grid-cols-2 gap-3">
//           <div>
//             <label className="text-sm font-medium text-gray-700 block mb-1">
//               Priority
//             </label>
//             <select
//               className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               {...register("priority")}
//             >
//               <option value="low">Low</option>
//               <option value="medium">Medium</option>
//               <option value="high">High</option>
//             </select>
//           </div>
//           <Input label="Due date" type="date" {...register("due_date")} />
//         </div>

//         <div className="flex gap-2 justify-between pt-2 border-t border-gray-100">
//           <Button
//             type="button"
//             variant="danger"
//             size="sm"
//             onClick={handleDelete}
//           >
//             Delete task
//           </Button>
//           <div className="flex gap-2">
//             <Button type="button" variant="outline" size="sm" onClick={onClose}>
//               Cancel
//             </Button>
//             <Button type="submit" size="sm" loading={saving}>
//               Save changes
//             </Button>
//           </div>
//         </div>
//       </form>

//       <div className="mt-5 pt-5 border-t border-gray-100">
//         <h3 className="text-sm font-semibold text-gray-700 mb-3">
//           Comments ({comments.length})
//         </h3>
//         <div className="flex flex-col gap-3 mb-3">
//           {comments.length === 0 && (
//             <p className="text-sm text-gray-400">No comments yet</p>
//           )}
//           {comments.map((c) => (
//             <div key={c.id} className="bg-gray-50 rounded-lg p-3">
//               <div className="flex items-center justify-between mb-1">
//                 <span className="text-xs font-medium text-gray-600">
//                   {c.profiles?.full_name || c.profiles?.email || "User"}
//                 </span>
//                 <div className="flex items-center gap-2">
//                   <span className="text-xs text-gray-400">
//                     {formatDate(c.created_at)}
//                   </span>
//                   {c.user_id === user?.id && (
//                     <button
//                       onClick={() => handleDeleteComment(c.id)}
//                       className="text-gray-300 hover:text-red-400 text-xs"
//                     >
//                       X
//                     </button>
//                   )}
//                 </div>
//               </div>
//               <p className="text-sm text-gray-700">{c.content}</p>
//             </div>
//           ))}
//         </div>
//         <div className="flex gap-2">
//           <input
//             type="text"
//             value={comment}
//             onChange={(e) => setComment(e.target.value)}
//             onKeyDown={(e) => {
//               if (e.key === "Enter") handleAddComment();
//             }}
//             placeholder="Add a comment..."
//             className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//           <Button size="sm" onClick={handleAddComment} loading={addingComment}>
//             Post
//           </Button>
//         </div>
//         <div>
//           <div className="flex items-center justify-between mb-1.5">
//             <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
//               Description
//             </label>
//             <button
//               type="button"
//               onClick={handleGenerateDescription}
//               disabled={generatingDesc}
//               className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 disabled:opacity-50 transition-colors font-medium"
//             >
//               {generatingDesc ? (
//                 <>
//                   <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
//                   Generating...
//                 </>
//               ) : (
//                 <>
//                   <svg
//                     width="12"
//                     height="12"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="2"
//                   >
//                     <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z" />
//                   </svg>
//                   AI write
//                 </>
//               )}
//             </button>
//           </div>
//           <textarea
//             rows={3}
//             placeholder="Add more details... or click AI write ✨"
//             className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none transition-colors"
//             {...register("description")}
//           />
//         </div>
//       </div>
//     </Modal>
//   );
// }
// export default TaskModal;

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useProjects } from "../../context/ProjectsContext";
import { useForm } from "react-hook-form";
import { tasksApi } from "../../services/tasksApi";
import { toast } from "react-toastify";
import { formatDate } from "../../utils/helpers";
import { generateTaskDescription } from "../../services/aiApi";
import Modal from "../common/Modal";
import Input from "../common/Input";
import Button from "../common/Button";

const priorityOptions = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const statusOptions = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
];

function TaskModal({ task, isOpen, onClose }) {
  const { user } = useAuth();
  // ✅ Fix 1 — destructure projects and tasks so handleGenerateDescription works
  const { updateTask, deleteTask, projects, tasks } = useProjects();
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [addingComment, setAddingComment] = useState(false);
  const [generatingDesc, setGeneratingDesc] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description || "",
        priority: task.priority,
        status: task.status,
        due_date: task.due_date || "",
      });
      loadComments();
    }
  }, [task]);

  const loadComments = async () => {
    try {
      const data = await tasksApi.getComments(task.id);
      setComments(data);
    } catch (err) {
      console.error("Failed to load comments", err);
    }
  };

  // ✅ Fix 2 — now uses projects and tasks correctly
  const handleGenerateDescription = async () => {
    const titleEl = document.querySelector('input[name="title"]');
    const title = titleEl?.value?.trim();
    if (!title) {
      toast.error("Enter a task title first");
      return;
    }
    setGeneratingDesc(true);
    try {
      const project = projects?.find(
        (p) => tasks?.find((t) => t.id === task?.id)?.project_id === p.id,
      );
      const desc = await generateTaskDescription(
        title,
        project?.name || "the project",
      );
      setValue("description", desc);
      toast.success("Description generated!");
    } catch {
      toast.error("Failed to generate description");
    } finally {
      setGeneratingDesc(false);
    }
  };

  const onSave = async (values) => {
    setSaving(true);
    try {
      await updateTask(task.id, values);
      toast.success("Task updated");
      onClose();
    } catch {
      toast.error("Failed to update task");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this task?")) return;
    try {
      await deleteTask(task.id);
      toast.success("Task deleted");
      onClose();
    } catch {
      toast.error("Failed to delete task");
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    setAddingComment(true);
    try {
      const newComment = await tasksApi.addComment({
        task_id: task.id,
        user_id: user.id,
        content: comment.trim(),
      });
      setComments((prev) => [...prev, newComment]);
      setComment("");
    } catch {
      toast.error("Failed to add comment");
    } finally {
      setAddingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await tasksApi.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch {
      toast.error("Failed to delete comment");
    }
  };

  if (!task) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Task details" size="xl">
      <form onSubmit={handleSubmit(onSave)} className="flex flex-col gap-4">
        {/* Title */}
        <Input
          label="Title"
          error={errors.title?.message}
          {...register("title", { required: "Title is required" })}
        />

        {/* ✅ Fix 3 — ONE description field with AI write button, inside the form */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Description
            </label>
            <button
              type="button"
              onClick={handleGenerateDescription}
              disabled={generatingDesc}
              className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 disabled:opacity-50 transition-colors font-medium"
            >
              {generatingDesc ? (
                <>
                  <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z" />
                  </svg>
                  AI write
                </>
              )}
            </button>
          </div>
          <textarea
            rows={3}
            placeholder="Add more details... or click AI write ✨"
            className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none transition-colors"
            {...register("description")}
          />
        </div>

        {/* Priority + Status + Due date */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide block mb-1.5">
              Priority
            </label>
            <select
              className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 transition-colors"
              {...register("priority")}
            >
              {priorityOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide block mb-1.5">
              Status
            </label>
            <select
              className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 transition-colors"
              {...register("status")}
            >
              {statusOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <Input label="Due date" type="date" {...register("due_date")} />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-600 dark:text-red-400 transition-colors px-2 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="3,6 5,6 21,6" />
              <path d="M19,6l-1,14a2,2,0,0,1-2,2H8a2,2,0,0,1-2-2L5,6" />
              <path d="M10,11v6M14,11v6" />
              <path d="M9,6V4a1,1,0,0,1,1-1h4a1,1,0,0,1,1,1V6" />
            </svg>
            Delete task
          </button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={saving}>
              Save changes
            </Button>
          </div>
        </div>
      </form>

      {/* Comments — outside the form */}
      <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800">
        <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-4">
          Comments · {comments.length}
        </h3>

        <div className="flex flex-col gap-3 mb-4">
          {comments.length === 0 && (
            <div className="text-center py-6">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="1.5"
                className="mx-auto mb-2"
              >
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                No comments yet. Be the first!
              </p>
            </div>
          )}
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3 group">
              <div className="w-7 h-7 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold text-blue-600 dark:text-blue-300">
                {(c.profiles?.full_name ||
                  c.profiles?.email ||
                  "U")[0].toUpperCase()}
              </div>
              <div className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    {c.profiles?.full_name || c.profiles?.email || "User"}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {formatDate(c.created_at)}
                    </span>
                    {c.user_id === user?.id && (
                      <button
                        onClick={() => handleDeleteComment(c.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-300 dark:text-slate-600 hover:text-red-400 transition-all"
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {c.content}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Add comment input */}
        <div className="flex gap-2 items-end">
          <div className="w-7 h-7 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold text-blue-600 dark:text-blue-300">
            {(user?.user_metadata?.full_name ||
              user?.email ||
              "U")[0].toUpperCase()}
          </div>
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) handleAddComment();
              }}
              placeholder="Write a comment..."
              className="flex-1 px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors"
            />
            <Button
              size="sm"
              onClick={handleAddComment}
              loading={addingComment}
            >
              Post
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default TaskModal;
