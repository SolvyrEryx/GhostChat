const passphraseInput = document.getElementById('passphrase');
const saveBtn = document.getElementById('save');
const clearBtn = document.getElementById('clear');
const statusDiv = document.getElementById('status');
const indicator = document.getElementById('indicator');
const statusText = document.getElementById('statusText');

const bootScreen = document.getElementById('bootScreen');
const bootText = document.getElementById('bootText');
const mainUI = document.getElementById('mainUI');

const bootLines = [
  "Initializing GhostChat...",
  "Loading encryption modules...",
  "Verifying key integrity...",
  "Establishing secure environment...",
  "System ready."
];

let lineIndex = 0;

function typeBootLine() {
  if (lineIndex >= bootLines.length) {
    setTimeout(() => {
      bootScreen.classList.add('fade-out');
      setTimeout(() => {
        bootScreen.style.display = 'none';
        mainUI.style.display = 'block';
      }, 300);
    }, 400);
    return;
  }

  bootText.textContent += bootLines[lineIndex] + "\n";
  lineIndex++;
  setTimeout(typeBootLine, 120);
}

typeBootLine();

/* ================= Main Functionality ================= */

function updateIndicator(active) {
  if (active) {
    indicator.classList.add('active');
    statusText.textContent = 'Encryption active';
  } else {
    indicator.classList.remove('active');
    statusText.textContent = 'Encryption inactive';
  }
}

chrome.storage.local.get(['passphrase'], (result) => {
  if (result.passphrase) {
    passphraseInput.value = result.passphrase;
    updateIndicator(true);
  } else {
    updateIndicator(false);
  }
});

saveBtn.addEventListener('click', () => {
  const passphrase = passphraseInput.value.trim();
  if (!passphrase) {
    showStatus('Enter a passphrase', 'red');
    return;
  }

  chrome.storage.local.set({ passphrase }, () => {
    updateIndicator(true);
    showStatus('Passphrase saved', '#22FFAA');
  });
});

clearBtn.addEventListener('click', () => {
  chrome.storage.local.remove('passphrase', () => {
    passphraseInput.value = '';
    updateIndicator(false);
    showStatus('Passphrase cleared', '#9CA3AF');
  });
});

function showStatus(text, color) {
  statusDiv.textContent = text;
  statusDiv.style.color = color;
  setTimeout(() => {
    statusDiv.textContent = '';
  }, 3000);
}