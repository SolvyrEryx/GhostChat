// content.js – GhostChat
// Shift to encrypt (atomic replacement)
// Structure-free decryption via text scanning
// Premium cyber toggle styling

let encryptionEnabled = false;
let currentPassphrase = null;
let toggleButton = null;
let buttonContainer = null;
let currentInput = null;
let isProcessingShift = false;
const PROCESSED_ATTR = 'data-ghostchat-processed';

console.log('[GhostChat] Content script loaded');

async function init() {
  console.log('[GhostChat] Initialising...');
  await loadPassphrase();

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.passphrase) {
      currentPassphrase = changes.passphrase.newValue || null;
      console.log('[GhostChat] Passphrase updated:', currentPassphrase ? 'set' : 'cleared');
    }
  });

  observeInputField();
  observeNewMessages();
}

async function loadPassphrase() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['passphrase'], (result) => {
      currentPassphrase = result.passphrase || null;
      console.log('[GhostChat] Passphrase loaded:', currentPassphrase ? 'yes' : 'no');
      resolve();
    });
  });
}

function observeInputField() {
  const inputSelector = 'div[role="textbox"][contenteditable="true"]';

  const observer = new MutationObserver(() => {
    const input = document.querySelector(inputSelector);

    if (input) {
      if (!buttonContainer || !buttonContainer.isConnected) {
        injectToggleButton(input);
      } else if (currentInput !== input) {
        if (currentInput) currentInput.removeEventListener('keydown', handleShift);
        input.addEventListener('keydown', handleShift);
        currentInput = input;
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  const input = document.querySelector(inputSelector);
  if (input) injectToggleButton(input);
}

function injectToggleButton(inputElement) {
  if (buttonContainer && buttonContainer.isConnected) return;

  buttonContainer = document.createElement('div');
  buttonContainer.style.position = 'absolute';
  buttonContainer.style.top = '0';
  buttonContainer.style.right = '0';
  buttonContainer.style.zIndex = '10000';

  toggleButton = document.createElement('button');
  toggleButton.type = 'button';

  // SVG lock icon
  toggleButton.innerHTML = `
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22FFAA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="5" y="11" width="14" height="10" rx="2"></rect>
    <path d="M8 11V7a4 4 0 0 1 8 0v4"></path>
  </svg>
  `;

  Object.assign(toggleButton.style, {
    background: '#121821',
    border: '1px solid #1F2937',
    borderRadius: '20px',
    padding: '6px 10px',
    margin: '4px',
    cursor: 'pointer',
    boxShadow: '0 0 0 rgba(34,255,170,0)',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  });

  toggleButton.title = 'GhostChat Disabled';

  toggleButton.addEventListener('click', toggleEncryption);

  buttonContainer.appendChild(toggleButton);

  const container = inputElement.parentElement;
  if (container && getComputedStyle(container).position === 'static') {
    container.style.position = 'relative';
  }

  container.appendChild(buttonContainer);

  inputElement.addEventListener('keydown', handleShift);
  currentInput = inputElement;
}

function toggleEncryption() {
  encryptionEnabled = !encryptionEnabled;

  if (encryptionEnabled) {
    toggleButton.style.border = '1px solid #22FFAA';
    toggleButton.style.boxShadow = '0 0 10px rgba(34,255,170,0.6)';
    toggleButton.title = 'GhostChat Enabled — Encryption Active';
  } else {
    toggleButton.style.border = '1px solid #1F2937';
    toggleButton.style.boxShadow = '0 0 0 rgba(0,0,0,0)';
    toggleButton.title = 'GhostChat Disabled';
  }

  console.log('[GhostChat] Encryption', encryptionEnabled ? 'ENABLED' : 'DISABLED');
}

async function replaceWithTyping(el, text) {
  el.focus();

  document.execCommand('selectAll', false, null);
  await new Promise(r => setTimeout(r, 20));

  for (const char of text) {
    el.dispatchEvent(new InputEvent('beforeinput', {
      inputType: 'insertText',
      data: char,
      bubbles: true,
      cancelable: true
    }));

    document.execCommand('insertText', false, char);
    await new Promise(r => setTimeout(r, 8));
  }

  el.dispatchEvent(new Event('input', { bubbles: true }));
  await new Promise(r => setTimeout(r, 40));
}

async function handleShift(event) {
  if (event.key !== 'Shift' || event.shiftKey === false) return;
  if (event.ctrlKey || event.altKey || event.metaKey) return;

  const input = event.target;

  await new Promise(r => setTimeout(r, 0));

  const plaintext = input.innerText || input.value;
  if (!plaintext.trim()) return;
  if (plaintext.startsWith('[ENC]')) return;
  if (!encryptionEnabled) return;
  if (!currentPassphrase) {
    alert('GhostChat: Please set a passphrase in the extension popup first.');
    return;
  }

  if (isProcessingShift) return;
  isProcessingShift = true;

  try {
    const encrypted = await encryptMessage(plaintext, currentPassphrase);
    await replaceWithTyping(input, encrypted);
  } catch (error) {
    console.error('[GhostChat] Encryption failed:', error);
    alert('GhostChat: Encryption failed. Check console.');
  } finally {
    isProcessingShift = false;
  }
}

/* ===================== DECRYPTION ===================== */

function observeNewMessages() {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType !== Node.ELEMENT_NODE) continue;
        scanForEncryptedText(node);
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

function scanForEncryptedText(root) {
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  let textNode;
  while ((textNode = walker.nextNode())) {
    const text = textNode.nodeValue.trim();
    if (!text.startsWith('[ENC]')) continue;

    const parent = textNode.parentElement;
    if (!parent) continue;
    if (parent.hasAttribute(PROCESSED_ATTR)) continue;

    parent.setAttribute(PROCESSED_ATTR, 'true');
    decryptAndDisplay(parent, text);
  }
}

async function decryptAndDisplay(container, fullText) {
  if (!currentPassphrase) {
    showDecryptionError(container, 'Passphrase not set');
    return;
  }

  try {
    const decrypted = await decryptMessage(fullText, currentPassphrase);
    showDecrypted(container, decrypted);
  } catch {
    showDecryptionError(container, 'Wrong passphrase or corrupted');
  }
}

function showDecrypted(el, text) {
  const overlay = document.createElement('div');
  overlay.textContent = `🔓 ${text}`;

  Object.assign(overlay.style, {
    background: '#121821',
    border: '1px solid #22FFAA',
    color: '#22FFAA',
    padding: '6px 12px',
    margin: '4px 0',
    borderRadius: '8px',
    fontSize: '0.9em',
    fontFamily: 'monospace',
    boxShadow: '0 0 8px rgba(34,255,170,0.4)',
    wordBreak: 'break-word',
    opacity: '0',
    transition: 'opacity 0.2s ease'
  });

  el.parentNode.insertBefore(overlay, el);

  requestAnimationFrame(() => {
    overlay.style.opacity = '1';
  });
}

function showDecryptionError(el, reason) {
  const overlay = document.createElement('div');
  overlay.textContent = `❌ ${reason}`;

  Object.assign(overlay.style, {
    background: '#1A1111',
    border: '1px solid #FF3B3B',
    color: '#FF3B3B',
    padding: '6px 12px',
    margin: '4px 0',
    borderRadius: '8px',
    fontSize: '0.9em',
    fontFamily: 'monospace',
    boxShadow: '0 0 6px rgba(255,59,59,0.4)',
    wordBreak: 'break-word'
  });

  el.parentNode.insertBefore(overlay, el);
}

init();