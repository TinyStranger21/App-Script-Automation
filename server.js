const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Your Apps Script URL (backend target)
const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzdSL1j81gorBCgfusIw_y_RPoCHNvHHOY09PPdYJgbSa4O5p46PagUdQn5y4emAldm/exec";

// Parse JSON bodies
app.use(express.json());

// Allow your static page (file:// or localhost) to call this proxy
app.use(
  cors({
    origin: "*",
    methods: ["POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  }),
);

// Preflight handler for /commute
app.options("/commute", (req, res) => {
  res.sendStatus(204);
});

// Proxy endpoint
app.post("/commute", async (req, res) => {
  try {
    // Use built-in fetch in recent Node versions
    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify(req.body),
    });

    const text = await response.text();

    // Pass through status and JSON body
    res
      .status(response.status)
      .set("Content-Type", "application/json;charset=utf-8")
      .send(text);
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({
      status: "error",
      message: "Proxy failed: " + error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Kai's Bus Tracker proxy running on http://localhost:${PORT}`);
});

