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

async function getDeepSeekResponse(message) {
  try {
    const fullPrompt = `${shadybotPrompt}"${message}"`;
    const response = await fetch('/.netlify/functions/fakegpt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: fullPrompt })
    });
    if (!response.ok) throw new Error('API request failed');
    const data = await response.json();
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
  userInput.disabled = false;
  userInput.focus();
}

sendButton.addEventListener("click", handleUserInput);