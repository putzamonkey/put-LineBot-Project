<template>
  <div class="container">
    <!-- ✅ Status Indicators (Centered Above) -->
    <div class="status-container">
      <h2>Bot Status: <span :class="botStatus ? 'running' : 'stopped'">{{ botStatus ? '🟢 Running' : '🔴 Stopped' }}</span></h2>
      <h2>Ngrok Status: <span :class="ngrokStatus ? 'running' : 'stopped'">{{ ngrokStatus ? '🟢 Running' : '🔴 Stopped' }}</span></h2>
    </div>

    <!-- ✅ Two-Column Layout -->
    <div class="content-container">
      <!-- Left Side: Terminal Output -->
      <div class="terminal-section">
        <h2>Terminal Output</h2>
        <pre ref="terminalOutput">{{ output }}</pre>
        <button @click="clearTerminalLogs" class="clear-button">🗑 Clear Terminal Output</button>
      </div>

      <!-- Right Side: Log File Output -->
      <div class="log-section">
        <h2>Log File</h2>
        <pre>{{ logs }}</pre>
        <button @click="clearLogFile" class="clear-log-button">🗑 Clear Log File</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      botStatus: false,
      ngrokStatus: false,
      logs: "",
      output: "",
    };
  },
  methods: {
    async fetchLogs() {
      const res = await fetch("http://localhost:3001/logs");
      this.logs = await res.text();
    },
    async checkStatus() {
      const botRes = await fetch("http://localhost:3001/bot/status");
      const botData = await botRes.json();
      this.botStatus = botData.running;

      const ngrokRes = await fetch("http://localhost:3001/ngrok/status");
      const ngrokData = await ngrokRes.json();
      this.ngrokStatus = ngrokData.running;
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const terminal = this.$refs.terminalOutput;
        if (terminal) {
          terminal.scrollTop = terminal.scrollHeight;
        }
      });
    },
    async clearTerminalLogs() {
      await fetch("http://localhost:3001/terminal/clear", { method: "POST" });
      alert("Terminal logs cleared!");
      this.output = ""; // Clear UI display
    },
    async clearLogFile() {
      await fetch("http://localhost:3001/logs/clear", { method: "POST" });
      alert("Log file cleared!");
      this.logs = ""; // Clear UI display
    }
  },
  mounted() {
    this.fetchLogs();
    this.checkStatus();

    setInterval(() => {
      this.fetchLogs();
      this.checkStatus();
    }, 5000);

    const outputSocket = new WebSocket("ws://localhost:3002");
    outputSocket.onmessage = (event) => {
      this.output += event.data + "\n";
      this.scrollToBottom();
    };
  },
};
</script>

<style>
/* ✅ Set Background Color & Font */
body {
  background-color: #383737;
  font-family: 'Roboto', sans-serif;
  color: white; /* Make text readable */
  margin: 0;
  padding: 0;
}

/* ✅ Ensure Full Width Layout */
.container {
  max-width: 100%;
  margin: auto;
  text-align: center;
  padding: 20px;
}

.status-container {
  margin-bottom: 20px;
}

.running {
  color: #00ff00;
  font-weight: bold;
}

.stopped {
  color: #ff4444;
  font-weight: bold;
}

/* ✅ Two-Column Layout */
.content-container {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}

/* ✅ Terminal & Log Sections */
.terminal-section, .log-section {
  width: 50%;
  position: relative;
}
.clear-button {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background-color: red;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  font-weight: bold;
  border-radius: 5px;
}

.clear-button:hover {
  background-color: darkred;
}

.clear-log-button {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background-color: red;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  font-weight: bold;
  border-radius: 5px;
}

.clear-log-button:hover {
  background-color: darkred;
}

/* ✅ Styled Output Boxes */
pre {
  background: #222;
  color: #00FD61;
  padding: 10px;
  overflow: auto;
  max-height: 400px;
  white-space: pre-wrap;
  text-align: left;
  border-radius: 5px;
}
</style>
