require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Configuration, OpenAIApi } = require('openai');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.post('/generate-questions', async (req, res) => {
  const { articleText } = req.body;

  if (!articleText) {
    return res.status(400).json({ error: 'Missing articleText in request body.' });
  }

  try {
    const prompt = `
You are an expert CAT question setter.
Generate 5 multiple choice questions from the passage below.
Each question must be in the format:

{
  "q": "question?",
  "a": ["A", "B", "C", "D"],
  "correct": 1
}

Only return a valid JSON array (no explanation, no formatting).

Passage:
${articleText}
    `;

    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You generate valid JSON for CAT questions.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 800
    });

    const output = completion.data.choices[0].message.content.trim();

    let parsed;
    try {
      parsed = JSON.parse(output);
    } catch (e) {
      console.error('❌ Invalid JSON from GPT:', output);
      return res.status(500).json({ error: 'Invalid JSON format from GPT', raw: output });
    }

    res.json({ questions: parsed });
  } catch (error) {
    console.error('❌ OpenAI API Error:', error);
    res.status(500).json({ error: 'Failed to generate questions', details: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('✅ OpenAI CAT Question Generator API is live!');
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
