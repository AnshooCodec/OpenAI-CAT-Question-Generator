require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const OpenAI = require('openai'); // ✅ updated for SDK v4+

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // ✅ uses .env key
});

app.post('/generate-questions', async (req, res) => {
  const { articleText } = req.body;

  if (!articleText) {
    return res.status(400).json({ error: 'Missing articleText in request body.' });
  }

  try {
    const prompt = `Read the following passage and generate 5 CAT-style multiple choice questions. Each question must have 4 options and indicate the correct option index (0–3). Return the output as a JSON array of objects with keys: q, a, correct.\n\n${articleText}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are an expert CAT verbal question setter.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 800
    });

    const output = completion.choices[0].message.content;
    const parsed = JSON.parse(output);
    res.json({ questions: parsed });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Failed to generate questions',
      details: error.message || error.toString()
    });
  }
});

app.get('/', (req, res) => {
  res.send('OpenAI CAT Question Generator is running!');
});

app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});
