import "dotenv/config";
import express from "express";
import cors from "cors";
import pg from "pg";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clientDist = path.join(__dirname, "../client/dist");

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(clientDist));

/* -----------------------------
   PostgreSQL
----------------------------- */

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes("localhost")
        ? false
        : { rejectUnauthorized: false },
    })
  : null;

/* -----------------------------
   Supabase
----------------------------- */

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

/* -----------------------------
   Helpers
----------------------------- */

function cleanTransaction(row) {
  return {
    id: row.id,
    user_id: row.user_id,
    description: row.description,
    amount: Number(row.amount),
    type: row.type,
    category: row.category,
    payment: row.payment,
    date: row.transaction_date,
    notes: row.notes || "",
    createdAt: row.created_at,
  };
}

/* -----------------------------
   Authentication middleware
----------------------------- */

async function requireAuth(req, res, next) {
  try {
    if (!supabase) {
      return res.status(500).json({
        error: "Supabase is not configured on the server.",
      });
    }

    const authHeader = req.headers.authorization || "";

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Authentication required.",
      });
    }

    const accessToken = authHeader.replace("Bearer ", "").trim();

    if (!accessToken) {
      return res.status(401).json({
        error: "Authentication token missing.",
      });
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return res.status(401).json({
        error: "Invalid or expired authentication session.",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("Authentication error:", error);

    return res.status(401).json({
      error: "Unable to verify authentication.",
    });
  }
}

/* -----------------------------
   Health
----------------------------- */

app.get("/api/health", async (req, res) => {
  if (!pool) {
    return res.status(500).json({
      ok: false,
      database: "not configured",
    });
  }

  try {
    await pool.query("SELECT 1");

    res.json({
      ok: true,
      database: "connected",
    });
  } catch (error) {
    console.error("Database health error:", error);

    res.status(500).json({
      ok: false,
      database: "error",
      message: error.message,
    });
  }
});

/* -----------------------------
   GET TRANSACTIONS
----------------------------- */

app.get("/api/transactions", requireAuth, async (req, res) => {
  if (!pool) {
    return res.status(500).json({
      error: "Database is not configured.",
    });
  }

  try {
    const result = await pool.query(
      `
      SELECT
        id,
        user_id,
        description,
        amount,
        type,
        category,
        payment,
        transaction_date,
        notes,
        created_at
      FROM transactions
      WHERE user_id = $1
      ORDER BY transaction_date DESC, created_at DESC
      `,
      [req.user.id]
    );

    res.json(result.rows.map(cleanTransaction));
  } catch (error) {
    console.error("Get transactions error:", error);

    res.status(500).json({
      error: "Unable to load transactions.",
    });
  }
});

/* -----------------------------
   CREATE TRANSACTION
----------------------------- */

app.post("/api/transactions", requireAuth, async (req, res) => {
  if (!pool) {
    return res.status(500).json({
      error: "Database is not configured.",
    });
  }

  try {
    const {
      description,
      amount,
      type,
      category,
      payment,
      date,
      notes,
    } = req.body;

    if (!description || !amount || !type || !category || !date) {
      return res.status(400).json({
        error: "Missing required transaction fields.",
      });
    }

    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({
        error: "Transaction type must be income or expense.",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO transactions
      (
        user_id,
        description,
        amount,
        type,
        category,
        payment,
        transaction_date,
        notes
      )
      VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING
        id,
        user_id,
        description,
        amount,
        type,
        category,
        payment,
        transaction_date,
        notes,
        created_at
      `,
      [
        req.user.id,
        description,
        Number(amount),
        type,
        category,
        payment || "Other",
        date,
        notes || "",
      ]
    );

    res.status(201).json(cleanTransaction(result.rows[0]));
  } catch (error) {
    console.error("Create transaction error:", error);

    res.status(500).json({
      error: "Unable to create transaction.",
    });
  }
});

/* -----------------------------
   UPDATE TRANSACTION
----------------------------- */

app.put("/api/transactions/:id", requireAuth, async (req, res) => {
  if (!pool) {
    return res.status(500).json({
      error: "Database is not configured.",
    });
  }

  try {
    const { id } = req.params;

    const {
      description,
      amount,
      type,
      category,
      payment,
      date,
      notes,
    } = req.body;

    if (!description || !amount || !type || !category || !date) {
      return res.status(400).json({
        error: "Missing required transaction fields.",
      });
    }

    const result = await pool.query(
      `
      UPDATE transactions
      SET
        description = $1,
        amount = $2,
        type = $3,
        category = $4,
        payment = $5,
        transaction_date = $6,
        notes = $7
      WHERE id = $8
        AND user_id = $9
      RETURNING
        id,
        user_id,
        description,
        amount,
        type,
        category,
        payment,
        transaction_date,
        notes,
        created_at
      `,
      [
        description,
        Number(amount),
        type,
        category,
        payment || "Other",
        date,
        notes || "",
        id,
        req.user.id,
      ]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        error: "Transaction not found.",
      });
    }

    res.json(cleanTransaction(result.rows[0]));
  } catch (error) {
    console.error("Update transaction error:", error);

    res.status(500).json({
      error: "Unable to update transaction.",
    });
  }
});

/* -----------------------------
   DELETE TRANSACTION
----------------------------- */

app.delete("/api/transactions/:id", requireAuth, async (req, res) => {
  if (!pool) {
    return res.status(500).json({
      error: "Database is not configured.",
    });
  }

  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM transactions
      WHERE id = $1
        AND user_id = $2
      RETURNING id
      `,
      [id, req.user.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        error: "Transaction not found.",
      });
    }

    res.json({
      success: true,
      id,
    });
  } catch (error) {
    console.error("Delete transaction error:", error);

    res.status(500).json({
      error: "Unable to delete transaction.",
    });
  }
});

/* -----------------------------
   AI INSIGHTS
----------------------------- */

app.post("/api/ai/insights", requireAuth, async (req, res) => {
  const provider = process.env.AI_PROVIDER || "";

  const key =
    provider === "openai"
      ? process.env.OPENAI_API_KEY
      : provider === "gemini"
      ? process.env.GEMINI_API_KEY
      : "";

  if (!provider || !key) {
    return res.status(503).json({
      error:
        "AI is not configured. Add AI_PROVIDER and the matching API key.",
    });
  }

  const data = req.body;

  const prompt = `
You are a spending-insight assistant.

Return JSON only with these keys:

{
  "title": "...",
  "summary": "...",
  "insights": [
    {
      "title": "...",
      "severity": "...",
      "insight": "...",
      "recommendation": "..."
    }
  ]
}

Do not provide professional financial advice.

Here is the user's spending data:

${JSON.stringify(data)}
`;

  try {
    if (provider === "openai") {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({
            model: process.env.OPENAI_MODEL || "gpt-4o-mini",
            messages: [
              {
                role: "user",
                content: prompt,
              },
            ],
            temperature: 0.3,
            response_format: {
              type: "json_object",
            },
          }),
        }
      );

      const json = await response.json();

      if (!response.ok) {
        return res.status(response.status).json({
          error: "OpenAI request failed.",
        });
      }

      return res.json(
        JSON.parse(json.choices[0].message.content)
      );
    }

    if (provider === "gemini") {
      const model =
        process.env.GEMINI_MODEL || "gemini-2.0-flash";

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: "application/json",
            },
          }),
        }
      );

      const json = await response.json();

      if (!response.ok) {
        return res.status(response.status).json({
          error: "Gemini request failed.",
        });
      }

      const text =
        json.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

      return res.json(JSON.parse(text));
    }

    return res.status(400).json({
      error: "Unsupported AI provider.",
    });
  } catch (error) {
    console.error("AI service error:", error);

    return res.status(500).json({
      error: "AI service unavailable.",
    });
  }
});

/* -----------------------------
   React fallback
----------------------------- */

app.get("*", (req, res) => {
  res.sendFile(
    path.join(clientDist, "index.html"),
    (error) => {
      if (error) {
        res
          .status(404)
          .send("Frontend build not found. Run: npm run build");
      }
    }
  );
});

/* -----------------------------
   Start server
----------------------------- */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Smart Expense Tracker running on http://localhost:${PORT}`
  );
});
