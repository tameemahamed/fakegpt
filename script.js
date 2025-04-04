const chatContainer = document.getElementById("chatContainer");
const shadybotPrompt = "act like you are some genz and some shady chatbot and answer the following question(do not ever say that you are acting shady): ";
const userInput = document.getElementById("userInput");
const sendButton = document.getElementById("sendButton");
const typingIndicator = document.getElementById("typingIndicator");
const searchButton = document.getElementById("searchButton");
const reasonButton = document.getElementById("reasonButton");
let isBotResponding = false;
let searchSelected = false;
let reasonSelected = false;

userInput.addEventListener('input', function() {
  this.style.height = 'auto';
  this.style.height = this.scrollHeight + 'px';
});

userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey && !isBotResponding) {
    e.preventDefault();
    handleUserInput();
  }
});

searchButton.addEventListener("click", () => {
  searchSelected = !searchSelected;
  searchButton.classList.toggle("active", searchSelected);
});

reasonButton.addEventListener("click", () => {
  reasonSelected = !reasonSelected;
  reasonButton.classList.toggle("active", reasonSelected);
});

function createWaveElement(text) {
  const wrapper = document.createElement("span");
  wrapper.classList.add("wave");
  text.split("").forEach((char, index) => {
    const span = document.createElement("span");
    span.textContent = char;
    span.style.animationDelay = `${index * 0.05}s`;
    wrapper.appendChild(span);
  });
  return wrapper;
}

function addMessage(message, isUser) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${isUser ? "user" : "bot"}`;
  const contentDiv = document.createElement("div");
  contentDiv.className = "message-content";
  typeof message === "string" ? contentDiv.textContent = message : contentDiv.appendChild(message);
  messageDiv.appendChild(contentDiv);
  chatContainer.insertBefore(messageDiv, typingIndicator);
  chatContainer.scrollTop = chatContainer.scrollHeight;
  return contentDiv;
}

function showTypingIndicator() {
  typingIndicator.style.display = "block";
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function hideTypingIndicator() {
  typingIndicator.style.display = "none";
}

async function simulateStreamingResponse(responseText) {
  return new Promise(resolve => {
    const responseDiv = addMessage("", false);
    let index = 0;
    const typeCharacter = () => {
      if (index < responseText.length) {
        responseDiv.textContent += responseText.charAt(index);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        index++;
        setTimeout(typeCharacter, 20);
      } else {
        hideTypingIndicator();
        isBotResponding = false;
        resolve();
      }
    };
    typeCharacter();
  });
}

async function simulateExtraProcess(text, duration = 2000) {
  return new Promise(resolve => {
    const waveElement = createWaveElement(text);
    const extraMsgDiv = addMessage(waveElement, false);
    setTimeout(() => {
      extraMsgDiv.parentElement.remove();
      resolve();
    }, duration);
  });
}


function markdownToText(markdown) {
  return markdown
    // Headers
    .replace(/#{1,6}\s*/g, '')
    // Bold and italic
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    // Links
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    // Images
    .replace(/!\[([^\]]+)\]\([^\)]+\)/g, '$1')
    // Lists
    .replace(/^[\*\-+]\s+/gm, '')
    // Code blocks
    .replace(/```[\s\S]*?```/g, '')
    // Inline code
    .replace(/`([^`]+)`/g, '$1')
    // Blockquotes
    .replace(/^>\s+/gm, '')
    // Horizontal rules
    .replace(/^\s*([-*_] *){3,}\s*$/gm, '')
    // Remove extra newlines
    .replace(/\n{2,}/g, '\n\n')
    // Trim whitespace
    .trim();
}

async function getDeepSeekResponse(message) {
  try {
    const fullPrompt = `${shadybotPrompt}"${message}"`;
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer <nije uggo banai falao>',
        'HTTP-Referer': 'https://www.sitename.com',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1:free',
        messages: [{ role: 'user', content: fullPrompt }],
      })
    });
    // if (!response.ok) throw new Error('API request failed');
    const data = await response.json();
    console.log(data.choices[0].message.content);
    // const markdownText = marked.parse(data.choices[0].message.content);
    // const { htmlToText } = require('html-to-text');
    // const plainText = markdownToText(marked.parse(markdownText));
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error:", error);
    return "Yo, can't vibe with that rn. Try again later maybe? 🙃";
  }
}


async function handleUserInput() {
  if (isBotResponding) return;
  const rawMessage = userInput.value.trim();
  if (!rawMessage) return;

  addMessage(rawMessage, true);
  userInput.value = "";
  userInput.disabled = true;
  userInput.style.height = 'auto';

  const processes = [];
  if (searchSelected) processes.push(simulateExtraProcess("Searching web...", 2000));
  if (reasonSelected) processes.push(simulateExtraProcess("Analyzing...", 2500));
  await Promise.all(processes);

  searchSelected = false;
  reasonSelected = false;
  searchButton.classList.remove("active");
  reasonButton.classList.remove("active");

  showTypingIndicator();
  isBotResponding = true;

  const apiResponse = await getDeepSeekResponse(rawMessage);
  await simulateStreamingResponse(apiResponse);
  // finalize(rawMessage);
  userInput.disabled = false;
  userInput.focus();
}

sendButton.addEventListener("click", handleUserInput);