require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { OpenAI } = require('openai');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post('/generate-questions', async (req, res) => {
  const { articleText } = req.body;

  if (!articleText) {
    return res.status(400).json({ error: 'Missing articleText in request body.' });
  }

  try {
    const prompt = `Generate 5 CAT-style multiple choice questions from the following passage. Each question must have 4 answer options and a correct option index. Format the output as an array of JSON objects like this: [{"q": "...", "a": ["...", "...", "...", "..."], "correct": 0}, ...]. Only return the JSON array, no explanations.\n\n${articleText}`;

    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a CAT exam question setter." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 800
    });

    const responseText = chatCompletion.choices[0].message.content.trim();

    let questions;
    try {
      questions = JSON.parse(responseText);
    } catch (err) {
      return res.status(500).json({
        error: 'Failed to parse questions from OpenAI response.',
        details: err.message,
        raw: responseText
      });
    }

    res.json({ questions });
  } catch (error) {
    console.error('❌ GPT Error:', error);
    res.status(500).json({ error: 'OpenAI API call failed', details: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('✅ OpenAI CAT Question Generator is running!');
});

app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});
