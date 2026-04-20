import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const app = express();
const PORT = 3001;

const API_KEY = process.env.VITE_AI_API_KEY;

console.log(
  "Groq API Key loaded:",
  API_KEY ? `gsk_...${API_KEY.slice(-6)}` : "NOT FOUND ❌",
);

app.use(cors({ origin: "*" }));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "TaskFlow AI proxy running ✅ (Groq)" });
});

app.post("/api/ai", async (req, res) => {
  if (!API_KEY) {
    return res
      .status(500)
      .json({ error: { message: "API key not configured on server" } });
  }

  try {
    const { messages, system, max_tokens } = req.body;

    const groqMessages = [];
    if (system) {
      groqMessages.push({ role: "system", content: system });
    }
    groqMessages.push(...messages);

    console.log("→ Sending to Groq...");

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: groqMessages,
          max_tokens: max_tokens || 1024,
          temperature: 0.7,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.log("← Groq error:", response.status, data);
      return res.status(response.status).json({
        error: { message: data.error?.message || "Groq API error" },
      });
    }

    const text = data.choices?.[0]?.message?.content || "";
    console.log("← Groq responded OK ✅");

    // Return in same format as Anthropic so frontend needs zero changes
    res.json({
      content: [{ type: "text", text }],
    });
  } catch (err) {
    console.log("← Server error:", err.message);
    res.status(500).json({ error: { message: err.message } });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 AI proxy running → http://localhost:${PORT}`);
  console.log(`   Using model: llama-3.1-8b-instant (Groq)\n`);
});
