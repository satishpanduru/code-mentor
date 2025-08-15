import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
app.use(cors({
  origin: "*", // allow Chrome extension
  methods: ["GET", "POST"]
}));
app.use(express.json());

app.post("/hint", async (req, res) => {
  const { problemTitle } = req.body;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{
          role: "user",
          parts: [{ text: `You're a helpful coding mentor. Give hints for the LeetCode problem: "${problemTitle}". Do NOT give full solution, just hints and guidance.` }]
        }]
      }
    );

    const reply = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, no hint available.";
    res.json({ reply });
  } catch (err) {
    console.error("Gemini API error:", err?.response?.data || err.message);
    res.status(500).json({ error: "Gemini API failed" });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`✅ Mentor backend running at http://localhost:${process.env.PORT}`);
});
