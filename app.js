require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));

// Helper function to get current date
function getCurrentDate() {
    return new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Chat endpoint

// ... (previous code remains the same until the chat endpoint)

app.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        const currentDate = new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        
        const prompt = `
        Today's date is ${currentDate}. Always use this as the current date when answering questions.
        
        You are a friendly multilingual assistant with two modes:
        
        1. LANGUAGE TRANSLATION MODE (when asked for translations):
        - Provide the translation in the target language
        - Show English translation in parentheses
        - Add pronunciation tips if helpful
        - Give cultural context when relevant
        Example: "Good morning in German is 'Guten Morgen' (Good morning). Pronounced 'goo-ten mor-gen'."
        
        2. CASUAL CONVERSATION MODE (for general chat):
        - Be friendly, warm, and engaging
        - Keep responses concise but natural
        - Ask follow-up questions when appropriate
        - For date/time questions, always reference today's date: ${currentDate}
        Example: 
        User: "What's today's date?" 
        You: "Today is ${currentDate}."
        
        Guidelines for both modes:
        - Use simple, clear language
        - Be culturally sensitive
        - Keep responses under 3 sentences unless more detail is needed
        - Use emojis occasionally to make it friendly 😊
        
        Current message: "${message}"
        `;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        res.json({ response: text });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
});

// ... (rest of the code remains the same)
// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});