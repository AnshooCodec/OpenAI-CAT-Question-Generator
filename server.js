require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { OpenAI } = require('openai');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/generate-questions', async (req, res) => {
  const { articleText } = req.body;

  if (!articleText) {
    return res.status(400).json({ error: 'Missing articleText in request body.' });
  }

  try {
    const prompt = `Read the following passage and generate 5 CAT-style multiple choice questions. Each question must have:
- a key "q" for the question
- a key "a" for an array of 4 options
- a key "correct" for the correct option index (0 to 3)

Return ONLY a pure JSON array.

Passage:
${articleText}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a CAT verbal expert that returns only pure JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const output = completion.choices[0].message.content;

    // 🔍 DEBUG LOG: raw GPT response
    console.log("🔍 GPT raw response:\n", output);

    // ✅ Try to extract the JSON array
    const jsonMatch = output.match(/\[\s*{[\s\S]*}\s*\]/);
    if (!jsonMatch) {
      throw new Error('AI response did not contain a valid JSON array.');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    res.json({ questions: parsed });
  } catch (error) {
    console.error('❌ GPT JSON parse error:', error.message);
    res.status(500).json({ error: 'Failed to generate questions', details: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('✅ OpenAI CAT Question Generator is running!');
});

app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});
