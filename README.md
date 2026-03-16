# 👻 GhostChat
http://ghostchat.rahulj.space/
**Reclaim your privacy.**

GhostChat is a lightweight Chrome extension that adds client-side AES-GCM encryption to Discord Web. Messages are encrypted inside your browser before they are sent, ensuring that only users with the shared passphrase can read them.

GhostChat does not use external servers.  
GhostChat does not collect data.  
GhostChat operates entirely within your browser.

---

## 🔐 Features

- Client-side **AES-GCM (256-bit)** encryption  
- Authenticated encryption (prevents tampering)  
- Zero server storage  
- No tracking or analytics  
- Shared-passphrase model  
- Structure-free DOM detection for decryption  
- Clean cyber-themed interface  
- Open-source transparency  

---

## ⚙️ How It Works

GhostChat performs encryption using the **Web Crypto API** built into modern browsers.

### Encryption Flow

1. Type your message in Discord Web.
2. Press **Shift** to encrypt it locally.
3. The plaintext is replaced with encrypted Base64 ciphertext.
4. Press **Enter** to send the encrypted message.
5. The recipient’s GhostChat instance detects and decrypts it locally using the shared passphrase.

Encryption occurs **before the message leaves your browser**.

---

## 🔑 Shared Passphrase Requirement

GhostChat uses a shared-secret model:

- Both participants must have GhostChat installed.
- Both must use the **exact same passphrase**.
- Without the correct passphrase, encrypted messages remain unreadable.

GhostChat does not perform automatic key exchange or identity verification.  
Security depends on keeping your passphrase secret and strong.

---

## 🌐 Platform Support

Currently supported:

- ✅ Discord Web

Planned support:

- Additional mainstream web platforms  
- Expanded DOM integration model  
- Optional auto-encryption mode  

---

## 🚀 Installation (Manual – 60 Seconds)

GhostChat is not yet published on the Chrome Web Store.

### Step 1 – Download

Click **Code → Download ZIP**, then extract the folder.

OR clone the repository:

```bash
git clone https://github.com/yourusername/ghostchat.git
```

---

### Step 2 – Open Chrome Extensions

Navigate to:

chrome://extensions

Enable **Developer Mode** (top-right toggle).

---

### Step 3 – Load the Extension

Click **Load unpacked**  
Select the extracted GhostChat folder.

GhostChat will now appear in your extensions list.

---

## 🔧 How to Use

1. Open **Discord Web**
2. Click the GhostChat icon in your toolbar
3. Enter your secret passphrase and save it
4. Enable encryption using the in-chat toggle
5. Type your message normally
6. Press **Shift** to encrypt it
7. Confirm the text changes to encrypted format
8. Press **Enter** to send

⚠️ **Important:** You must press **Shift before Enter** to encrypt the message.

---

## 🛡 Security Model

GhostChat follows a zero-trust philosophy:

- No backend servers  
- No remote key storage  
- No telemetry  
- No hidden API calls  

### Cryptography Details

- AES-GCM (Authenticated Encryption)
- 96-bit IV generated per message
- Browser-native Web Crypto API
- Base64 encoding for transport compatibility

All encryption and decryption happens locally.

---

## ⚠️ Limitations

- Requires manual encryption trigger (Shift key)
- Requires both parties to install the extension
- Requires shared passphrase agreement
- Currently supports Discord Web only

GhostChat does not replace native end-to-end encryption systems.  
It adds an additional client-side encryption layer.

---

## 📖 Philosophy

GhostChat exists to demonstrate that privacy tools do not require centralized infrastructure.

Encryption should be:

- Transparent  
- User-controlled  
- Lightweight  
- Accessible  

Digital sovereignty begins at the client.

---

## 📜 Disclaimer

GhostChat is an independent open-source project and is not affiliated with Discord Inc.

This project is provided “as is”, without warranty of any kind.  
Encryption is only as secure as the strength and secrecy of your passphrase.

---

## 👨‍💻 Author

Built by **Rahul J**
