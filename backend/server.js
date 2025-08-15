import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());

app.post("/ask", async (req, res) => {
  try {
    const prompt = req.body.prompt;
    let aiResponse = "";

    if (process.env.AI_PROVIDER === "gemini") {
      const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      const data = await resp.json();
      aiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from Gemini.";
    }

    if (process.env.AI_PROVIDER === "openai") {
      const resp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are a helpful coding mentor. Give only hints, not full solutions." },
            { role: "user", content: prompt }
          ]
        })
      });

      const data = await resp.json();
      aiResponse = data?.choices?.[0]?.message?.content || "No response from OpenAI.";
    }

    res.json({ answer: aiResponse.trim() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error getting AI response" });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
