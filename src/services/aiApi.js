const AI_PROXY_URL =
  import.meta.env.VITE_AI_PROXY_URL || "http://localhost:3001/api/ai";

export async function sendMessageToAI(messages, systemPrompt) {
  const response = await fetch(AI_PROXY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "AI request failed");
  }

  const data = await response.json();
  return data.content[0].text;
}

export async function generateTasksFromAI(
  projectName,
  projectDescription,
  existingTasks,
) {
  const systemPrompt = `You are a project management assistant. When asked to generate tasks, you MUST respond with ONLY a valid JSON array. No explanation, no markdown, no extra text — just the raw JSON array.

Each task object must have exactly these fields:
- title (string, max 60 chars)
- description (string, max 150 chars)
- priority ("low" | "medium" | "high")
- status ("todo")

Example format:
[{"title":"Setup project repository","description":"Initialize Git repo and configure CI/CD pipeline","priority":"high","status":"todo"}]`;

  const userMessage = `Generate 6-8 practical tasks for this project:
Project name: ${projectName}
Description: ${projectDescription || "No description provided"}
${existingTasks.length > 0 ? `Existing tasks (avoid duplicates): ${existingTasks.map((t) => t.title).join(", ")}` : ""}`;

  const response = await fetch(AI_PROXY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "AI request failed");
  }

  const data = await response.json();
  const text = data.content[0].text;

  try {
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    throw new Error("AI returned invalid task format. Please try again.");
  }
}

export async function generateTaskDescription(taskTitle, projectName) {
  const systemPrompt = `You are a project management assistant. Generate a clear, concise task description in 1-2 sentences (max 120 characters). Return ONLY the description text, nothing else.`;

  const response = await fetch(AI_PROXY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 256,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Write a description for this task: "${taskTitle}" in project "${projectName}"`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "AI request failed");
  }

  const data = await response.json();
  return data.content[0].text.trim().replace(/^["']|["']$/g, "");
}
