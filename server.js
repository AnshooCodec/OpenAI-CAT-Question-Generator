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
Read the following passage and generate exactly 5 CAT-style multiple choice questions.
Each question should be returned in this JSON format:

[
  {
    "q": "Question text?",
    "a": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 1
  }
]

Passage:
${articleText}
`;

    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are an expert CAT verbal question setter.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const raw = completion.data.choices[0].message.content;
    const jsonMatch = raw.match(/\[\s*{[\s\S]*}\s*\]/);
    if (!jsonMatch) throw new Error('No valid JSON array found in OpenAI response.');

    const questions = JSON.parse(jsonMatch[0]);
    res.json({ questions });

  } catch (error) {
    console.error('Backend Error:', error.message);
    res.status(500).json({ error: 'Failed to generate questions', details: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('✅ OpenAI CAT Question Generator is running!');
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
