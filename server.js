require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

app.post('/generate-questions', (req, res) => {
  const { articleText } = req.body;

  if (!articleText) {
    return res.status(400).json({ error: 'Missing articleText in request body.' });
  }

  // ✅ Return dummy questions (offline-friendly)
  const mockQuestions = [
    {
      q: "What is the central idea of the passage?",
      a: [
        "Exploration of modern science",
        "Philosophical approach to ethics",
        "The role of technology in society",
        "The critique of modern education"
      ],
      correct: 1
    },
    {
      q: "According to the author, which is true?",
      a: [
        "Education systems are perfect",
        "Innovation is discouraged",
        "Learning is a continuous process",
        "Society needs fewer reforms"
      ],
      correct: 2
    },
    {
      q: "What tone does the author mostly use?",
      a: ["Humorous", "Critical", "Optimistic", "Sarcastic"],
      correct: 1
    },
    {
      q: "Which of the following is NOT mentioned in the article?",
      a: ["Artificial Intelligence", "Traditional values", "Historical context", "Scientific discovery"],
      correct: 0
    },
    {
      q: "Which one is the best inference?",
      a: [
        "Society benefits from constant questioning",
        "Change always leads to problems",
        "Education should be abolished",
        "History should not be studied"
      ],
      correct: 0
    }
  ];

  res.json({ questions: mockQuestions });
});

app.get('/', (req, res) => {
  res.send('✅ Mock CAT Question Generator is running!');
});

app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});
