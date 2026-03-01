const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

// Database connection
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Root route
app.get("/", (req, res) => {
  res.send("Kabutr backend running ✅");
});

// Health route
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// Create poster
app.post("/posters", async (req, res) => {
  try {
    const {
      clubName,
      title,
      summary,
      fullDetails,
      posterImageUrl,
      clubLogoUrl,
      registrationUrl,
    } = req.body;

    if (!clubName || !summary || !fullDetails || !posterImageUrl || !registrationUrl) {
      return res.status(400).json({ ok: false, error: "Missing required fields" });
    }

    const id =
      "p_" +
      Date.now().toString(36) +
      Math.random().toString(36).slice(2, 8);

    await db.query(
      `INSERT INTO posters
      (id, club_name, title, summary, full_details, poster_image_url, club_logo_url, registration_url)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        id,
        clubName,
        title || null,
        summary,
        fullDetails,
        posterImageUrl,
        clubLogoUrl || null,
        registrationUrl,
      ]
    );

    res.json({ ok: true, id });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Fetch poster
app.get("/posters/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT * FROM posters WHERE id=$1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, error: "Not found" });
    }

    res.json({ ok: true, poster: result.rows[0] });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("API running on", PORT);
});