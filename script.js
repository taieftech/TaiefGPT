
particlesJS('particles-js', {
  "particles": {
    "number": {
      "value": 50,
      "density": {
        "enable": true,
        "value_area": 800
      }
    },
    "color": {
      "value": "#00ffff"
    },
    "shape": {
      "type": "circle",
      "stroke": {
        "width": 0,
        "color": "#000000"
      },
      "polygon": {
        "nb_sides": 5
      }
    },
    "opacity": {
      "value": 0.5,
      "random": false,
      "anim": {
        "enable": false
      }
    },
    "size": {
      "value": 3,
      "random": true
    },
    "line_linked": {
      "enable": true,
      "distance": 150,
      "color": "#00ffff",
      "opacity": 0.4,
      "width": 1
    },
    "move": {
      "enable": true,
      "speed": 2,
      "direction": "none",
      "random": false,
      "straight": false,
      "out_mode": "out"
    }
  },
  "interactivity": {
    "detect_on": "canvas",
    "events": {
      "onhover": {
        "enable": true,
        "mode": "repulse"
      }
    },
    "modes": {
      "repulse": {
        "distance": 100,
        "duration": 0.4
      }
    }
  },
  "retina_detect": true
});


const chatbox = document.getElementById('chatbox');
const synth = window.speechSynthesis;
let darkTheme = true;
let voiceEnabled = true;
let memory = [];

function appendMessage(role, text) {
  const div = document.createElement('div');
  div.className = role;
  div.innerHTML = (role === 'user' ? '<strong>You:</strong> ' : '<strong>🤖 TAIEF:</strong> ');
  chatbox.appendChild(div);

  let i = 0;
  const typing = () => {
    if (i < text.length) {
      div.innerHTML += text.charAt(i);
      i++;
      chatbox.scrollTop = chatbox.scrollHeight;
      setTimeout(typing, 1);
    } else {
      if (role === 'bot' && voiceEnabled && text.length > 0) speak(text);
      if (typeof MathJax !== 'undefined') MathJax.typeset();
    }
  };
  
  typing();
}

async function send() {
  const input = document.getElementById('input');
  const userText = input.value.trim();
  if (!userText) return;
  appendMessage('user', userText);
  input.value = '';

  memory.push({ role: 'user', content: userText });
  if (memory.length > 20) memory.shift();

  const model = document.getElementById('modelSelect').value;
  const persona = document.getElementById('personaSelect').value;
  document.getElementById('typingIndicator').style.display = 'block';
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer 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',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'system', content: persona }, ...memory]
      })
    });

    if (!response.ok) throw new Error('API Error ' + response.status);
    const data = await response.json();
    let botReply = data.choices[0].message.content;
     botReply = botReply.replace(/\$\$|\$|`/g, '').replace(/\n/g, '\n');
    appendMessage('bot', botReply);
    memory.push({ role: 'assistant', content: botReply });
    if (memory.length > 20) memory.shift();
  } catch (err) {
    appendMessage('bot', 'Error: ' + err.message);
  } finally {
    document.getElementById('typingIndicator').style.display = 'none';
  }
}

function speak(text) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    synth.speak(utterance);
  }
}

function toggleTheme() {
  if (darkTheme) {
    document.body.style.background = 'white';
    document.body.style.color = 'black';
    darkTheme = false;
  } else {
    document.body.style.background = 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)';
    document.body.style.color = 'white';
    darkTheme = true;
  }
}

function toggleVoice() {
  voiceEnabled = !voiceEnabled;
  document.getElementById('voiceToggle').textContent = voiceEnabled ? '🎶Voice ON' : 'Voice OFF';
}

function showMemory() {
  alert(memory.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n---\n'));
}

function exportChat() {
  const text = memory.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n---\n');
  const blob = new Blob([text], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = '🤖 Taief_You_chat_history.txt';
  a.click();
}
