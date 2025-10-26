const API_KEY = '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';  // 🔒 REMOVE old exposed key and replace with your real one safely
const API_URL = 'https://api.openai.com/v1/chat/completions';

document.addEventListener('DOMContentLoaded', () => {
  const chatWindow = document.getElementById('chat-window');
  const userInput = document.getElementById('user-input');
  const sendBtn = document.getElementById('send-btn');
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;

  // Theme toggle
  themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark');
    themeToggle.innerHTML = body.classList.contains('dark')
      ? '<i class="fa-solid fa-sun"></i> Light Mode'
      : '<i class="fa-solid fa-moon"></i> Dark Mode';
  });
  const voiceBtn = document.getElementById('voice-btn');

// 🎙️ Voice Recognition Setup
if ('webkitSpeechRecognition' in window) {
  const recognition = new webkitSpeechRecognition();
  recognition.continuous = false;
  recognition.lang = 'en-US';

  voiceBtn.addEventListener('click', () => {
    recognition.start();
    voiceBtn.textContent = '🎧 Listening...';
  });

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    userInput.value = transcript;
    voiceBtn.textContent = '🎤';
  };

  recognition.onerror = () => {
    voiceBtn.textContent = '🎤';
    alert('Voice recognition error. Please try again.');
  };

  recognition.onend = () => {
    voiceBtn.textContent = '🎤';
  };
} else {
  voiceBtn.disabled = true;
  voiceBtn.title = 'Speech recognition not supported on this browser.';
}
const fileInput = document.getElementById('file-input');
const fileLabel = document.getElementById('file-label');

fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (file) {
    addMessage(`📄 File attached: ${file.name}`, 'user');
  }
});


  async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    addMessage(message, 'user');
    userInput.value = '';

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `
You are an AI tutor that explains topics clearly, step-by-step.
If the question involves math or science, render equations in LaTeX ($ ... $).
At the end of your explanation, always add a short interactive quiz with 1–2 questions.
Format your responses in clean Markdown for readability.`
            },
            { role: 'user', content: message }
          ],
          temperature: 0.7,
          max_tokens: 300,
        }),
      });

      if (!response.ok) throw new Error(`API Error: ${response.status}`);

      const data = await response.json();
      const botReply = data.choices[0]?.message?.content || 'No response generated.';
      addMessage(botReply, 'bot', true);
    } catch (error) {
      console.error('Error:', error);
      addMessage(`⚠️ ${error.message}`, 'bot');
    }
  }

  // Render messages with Markdown + MathJax
  function addMessage(text, sender, renderMarkdown = false) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}`;

    if (renderMarkdown) {
      // Safe rendering (no inline HTML execution)
      msgDiv.innerHTML = marked.parse(text, { breaks: true });
    } else {
      msgDiv.textContent = text;
    }

    chatWindow.appendChild(msgDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;

    // Re-render MathJax after new content
    if (renderMarkdown && window.MathJax) {
      MathJax.typesetPromise([msgDiv]).catch(err => console.error(err));
    }
  }

  // Event listeners
  sendBtn.addEventListener('click', sendMessage);
  userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
});
