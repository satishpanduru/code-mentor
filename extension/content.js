(function() {
  let isOpen = false;

  // Create toggle button
  const toggleBtn = document.createElement("button");
  toggleBtn.id = "mentorToggle";
  toggleBtn.innerText = "💬 Ask AI";
  document.body.appendChild(toggleBtn);

  // Create widget (hidden initially)
  const widget = document.createElement("div");
  widget.id = "mentorWidget";
  widget.style.display = "none";
  widget.innerHTML = `
    <div id="mentorHeader">
      👨‍🏫 LeetCode Mentor
      <button id="mentorClose">✖</button>
    </div>
    <div id="mentorChat"></div>
    <div id="mentorInputArea">
      <input type="text" id="mentorInput" placeholder="Ask a question..." />
      <button id="mentorSend">➤</button>
    </div>
  `;
  document.body.appendChild(widget);

  const chatBox = document.getElementById("mentorChat");
  const input = document.getElementById("mentorInput");
  const sendBtn = document.getElementById("mentorSend");
  const closeBtn = document.getElementById("mentorClose");

  function addMessage(content, type) {
    const msg = document.createElement("div");
    msg.className = `mentor-msg ${type}`;
    msg.innerText = content;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    addMessage(text, "user-msg");
    input.value = "";

    const loadingMsg = document.createElement("div");
    loadingMsg.className = "mentor-msg bot-msg";
    loadingMsg.innerText = "🧠 Thinking...";
    chatBox.appendChild(loadingMsg);
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
      const res = await fetch("http://localhost:5001/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemTitle: text })
      });
      const data = await res.json();
      loadingMsg.remove();
      addMessage(data.reply, "bot-msg");
    } catch (err) {
      loadingMsg.remove();
      addMessage("⚠️ Error getting hints.", "bot-msg");
    }
  }

  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  toggleBtn.addEventListener("click", () => {
    isOpen = true;
    toggleBtn.style.display = "none";
    widget.style.display = "flex";

    // Auto-send problem title when opening
    const problemTitle = document.querySelector('div[class*="css-v3d350"]')?.innerText
                      || document.title.replace(" - LeetCode", "");
    if (problemTitle && chatBox.children.length === 0) {
      input.value = problemTitle;
      sendMessage();
    }
  });

  closeBtn.addEventListener("click", () => {
    isOpen = false;
    widget.style.display = "none";
    toggleBtn.style.display = "block";
  });
})();
