import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useProjects } from "../../context/ProjectsContext";
import { sendMessageToAI, generateTasksFromAI } from "../../services/aiApi";
import { toast } from "react-toastify";

const WELCOME_MESSAGE = {
  role: "assistant",
  content: `Hi! I'm your TaskFlow AI assistant. Here's what I can do:

- **Chat** — ask me anything about project management
- **Generate tasks** — say "generate tasks for [project name]"
- **Summarize** — ask "summarize my projects" or "what's overdue?"

How can I help you today?`,
};

function MessageBubble({ msg }) {
  const isUser = msg.role === "user";

  const formatContent = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br/>");
  };

  return (
    <div className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
          >
            <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2z" />
            <path d="M8 14s1.5 2 4 2 4-2 4-2" />
            <line x1="9" y1="9" x2="9.01" y2="9" />
            <line x1="15" y1="9" x2="15.01" y2="9" />
          </svg>
        </div>
      )}
      <div
        className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed
        ${
          isUser
            ? "bg-blue-600 text-white rounded-tr-sm"
            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-sm"
        }`}
        dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
      />
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-2.5">
      <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
        >
          <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2z" />
        </svg>
      </div>
      <div className="bg-slate-100 dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1">
        <span
          className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
          style={{ animationDelay: "0ms" }}
        />
        <span
          className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
          style={{ animationDelay: "150ms" }}
        />
        <span
          className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
          style={{ animationDelay: "300ms" }}
        />
      </div>
    </div>
  );
}

export default function AIChat({ isOpen, onClose }) {
  const { user } = useAuth();
  const { projects, tasks, createTask } = useProjects();
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatingTasks, setGeneratingTasks] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const buildSystemPrompt = () => {
    const projectsSummary = projects
      .map((p) => {
        const projectTasks = tasks.filter((t) => t.project_id === p.id);
        const done = projectTasks.filter((t) => t.status === "done").length;
        return `- ${p.name}: ${projectTasks.length} tasks, ${done} done`;
      })
      .join("\n");

    const overdue = tasks.filter(
      (t) =>
        t.due_date && new Date(t.due_date) < new Date() && t.status !== "done",
    );

    return `You are a smart project management assistant inside TaskFlow, a Kanban-based project management app.

The user's name is: ${user?.user_metadata?.full_name || "the user"}

Their current projects:
${projectsSummary || "No projects yet"}

Total tasks: ${tasks.length}
Completed tasks: ${tasks.filter((t) => t.status === "done").length}
Overdue tasks: ${overdue.length}${overdue.length > 0 ? ": " + overdue.map((t) => t.title).join(", ") : ""}

You can help with:
1. Answering questions about their projects and tasks
2. Project management advice
3. If they say "generate tasks for [project]", tell them to click the "Generate tasks" button for that project instead
4. Productivity tips

Keep responses concise and helpful. Use bullet points when listing things. Be friendly and encouraging.`;
  };

  const detectGenerateIntent = (text) => {
    const lower = text.toLowerCase();
    const hasGenerateKeyword =
      lower.includes("generate") ||
      lower.includes("create tasks") ||
      lower.includes("add tasks");
    if (!hasGenerateKeyword) return null;

    const project = projects.find((p) => lower.includes(p.name.toLowerCase()));
    return project || null;
  };

  const handleGenerateTasks = async (project) => {
    setGeneratingTasks(true);
    const projectTasks = tasks.filter((t) => t.project_id === project.id);

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: `Generating tasks for **${project.name}**... ⚡`,
      },
    ]);

    try {
      const generatedTasks = await generateTasksFromAI(
        project.name,
        project.description,
        projectTasks,
      );

      for (let i = 0; i < generatedTasks.length; i++) {
        await createTask({
          ...generatedTasks[i],
          project_id: project.id,
          position: projectTasks.length + i,
        });
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `✅ Done! Created **${generatedTasks.length} tasks** for **${project.name}**:\n\n${generatedTasks.map((t, i) => `${i + 1}. ${t.title} (${t.priority} priority)`).join("\n")}\n\nGo to the project board to see them!`,
        },
      ]);

      toast.success(
        `Created ${generatedTasks.length} tasks for ${project.name}!`,
      );
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Sorry, I had trouble generating tasks: ${err.message}. Please try again.`,
        },
      ]);
      toast.error("Failed to generate tasks");
    } finally {
      setGeneratingTasks(false);
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading || generatingTasks) return;

    const userMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Detect if user wants to generate tasks
    const targetProject = detectGenerateIntent(text);
    if (targetProject) {
      setLoading(false);
      await handleGenerateTasks(targetProject);
      return;
    }

    try {
      const history = [...messages, userMessage]
        .filter((m) => m.role === "user" || m.role === "assistant")
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }));

      const reply = await sendMessageToAI(history, buildSystemPrompt());

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Sorry, something went wrong: ${err.message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      label: "Summarize projects",
      text: "Give me a summary of all my projects",
    },
    { label: "What's overdue?", text: "What tasks are overdue?" },
    { label: "Productivity tip", text: "Give me a productivity tip for today" },
  ];

  if (!isOpen) return null;

  return (
    <div
      className="fixed bottom-20 right-4 md:right-6 z-50 w-[calc(100vw-2rem)] max-w-sm flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50 overflow-hidden transition-colors"
      style={{ height: "520px" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
            >
              <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2z" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              TaskFlow AI
            </p>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              <span className="text-xs text-slate-400 dark:text-slate-500">
                Online
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMessages([WELCOME_MESSAGE])}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            title="Clear chat"
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
            </svg>
          </button>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} />
        ))}
        {(loading || generatingTasks) && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Quick actions */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto shrink-0">
          {quickActions.map((a) => (
            <button
              key={a.label}
              onClick={() => {
                setInput(a.text);
                inputRef.current?.focus();
              }}
              className="shrink-0 text-xs px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-slate-600 dark:text-slate-400 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all whitespace-nowrap"
            >
              {a.label}
            </button>
          ))}
        </div>
      )}

      {/* Generate tasks shortcuts */}
      {projects.length > 0 && messages.length <= 1 && (
        <div className="px-4 pb-2 shrink-0">
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-1.5 font-medium">
            Generate tasks for:
          </p>
          <div className="flex gap-2 overflow-x-auto">
            {projects.slice(0, 3).map((p) => (
              <button
                key={p.id}
                onClick={() => handleGenerateTasks(p)}
                disabled={generatingTasks}
                className="shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all disabled:opacity-50 whitespace-nowrap"
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: p.color }}
                />
                {p.name.slice(0, 18)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
        <div className="flex gap-2 items-end">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) handleSend();
            }}
            placeholder="Ask anything..."
            disabled={loading || generatingTasks}
            className="flex-1 px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 disabled:opacity-50 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading || generatingTasks}
            className="w-9 h-9 flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-all shrink-0"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
            </svg>
          </button>
        </div>
        <p className="text-center text-xs text-slate-300 dark:text-slate-600 mt-2">
          Powered by Claude AI
        </p>
      </div>
    </div>
  );
}
