# Termina — Interactive Terminal Simulator

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=nextdotjs)
![React](https://img.shields.io/badge/React-18-blue?style=flat&logo=react)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.0-06B6D4?style=flat&logo=tailwindcss)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-Beta-yellow)

> **Termina** is a futuristic, gamified terminal environment built using **Next.js + React**.  
> It simulates a command-line interface where users can type commands, navigate a virtual file system, and complete **interactive coding challenges**.

---

## 🚀 Features

### 🖥️ Realistic Terminal Experience
- Fully interactive terminal simulation with command parsing  
- Supports command history, autocomplete, and virtual file navigation  
- Color-coded input/output and animated responses  

### 🎮 Gamified Learning
- Complete **challenges** in various categories (`basics`, `filesystem`, `networking`, etc.)
- Earn **XP**, **level up**, and **unlock new categories**
- Integrated **hint** and **tutorial** systems

### 🧩 Modular Architecture
- Extensible **Command Engine** (`executeCommand`)
- Virtual File System (`VirtualFileSystem`)  
- Challenge validation system (`validateCommand`)

### 🧠 Learning-Oriented
- Type `!tutorial` to begin structured lessons  
- Use `!categories` to explore challenge groups  
- Track progress via `!stats`

---

## 🧱 Tech Stack

| Technology | Purpose |
|-------------|----------|
| **Next.js (App Router)** | UI and routing |
| **React Hooks** | State and effect management |
| **TailwindCSS** | Styling |
| **TypeScript** | Type safety |
| **Lucide Icons + Shadcn/UI** | Minimal UI components |
| **Custom VFS + Command Engine** | Terminal logic and challenge handling |

---

## ⚙️ Installation

```bash
# Clone the repository
git clone https://github.com/aayush598/termina.git
cd termina

# Install dependencies
npm install

# Run the development server
npm run dev

# Open in your browser
http://localhost:3000
````

---

## 💻 Usage

Inside the terminal interface, try:

| Command            | Description                               |
| ------------------ | ----------------------------------------- |
| `help`             | List available commands                   |
| `!tutorial`        | Start beginner training                   |
| `!categories`      | View available challenge groups           |
| `!category <name>` | Switch to a challenge category            |
| `!hint`            | Get a hint for your current challenge     |
| `!stats`           | View your level, XP, and completion stats |
| `clear`            | Clear the terminal screen                 |
| `history`          | Show command history                      |
| `!reset`           | Restart your session                      |


---

## 🧙‍♂️ Example: Terminal Startup

```bash
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║  ████████╗███████╗██████╗ ███╗   ███╗██╗███╗   ██╗ █████╗     ║
║  ╚══██╔══╝██╔════╝██╔══██╗████╗ ████║██║████╗  ██║██╔══██╗    ║
║     ██║   █████╗  ██████╔╝██╔████╔██║██║██╔██╗ ██║███████║    ║
║     ██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║██║██║╚██╗██║██╔══██║    ║
║     ██║   ███████╗██║  ██║██║ ╚═╝ ██║██║██║ ╚████║██║  ██║    ║
║     ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝    ║
║                                                               ║
║                     Termina v0.0.1                            ║
║                [CLASSIFIED SYSTEM ACCESS]                     ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

[SYSTEM INITIALIZED] Welcome, operative.
Type 'help' for available commands
Type '!tutorial' to begin your training
```

---

## 🧑‍💻 Contributing

Contributions are welcome!

1. Fork the repo
2. Create a new branch (`feature/awesome-feature`)
3. Commit your changes
4. Open a Pull Request 🚀

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🌌 Author

**Developed by:** [Aayush Gid](https://github.com/aayush598)

**Version:** `v0.0.1`

---

## 🧠 Inspiration

> “Learning Linux doesn’t have to be dry.
> Let’s make the terminal your playground.” — *Termina Team*