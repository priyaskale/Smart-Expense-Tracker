import "dotenv/config";
import express from "express";
import cors from "cors";
import pg from "pg";
import path from "path";
import { fileURLToPath } from "url";

const {Pool}=pg;
const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);
const clientDist=path.join(__dirname,"../client/dist");
const app=express();
app.use(cors());
app.use(express.json());

// Serve the production React app from the same Node server on port 5000.
app.use(express.static(clientDist));

const pool=process.env.DATABASE_URL ? new Pool({connectionString:process.env.DATABASE_URL,ssl:process.env.DATABASE_URL.includes("localhost")?false:{rejectUnauthorized:false}}) : null;

app.get("/api/health",async(req,res)=>{
  if(!pool) return res.json({ok:true,database:"not configured",message:"Frontend demo mode is available."});
  try{await pool.query("select 1");res.json({ok:true,database:"connected"});}
  catch(e){res.status(500).json({ok:false,database:"error"});}
});

app.post("/api/ai/insights",async(req,res)=>{
  const provider=process.env.AI_PROVIDER||"";
  const key=provider==="openai"?process.env.OPENAI_API_KEY:provider==="gemini"?process.env.GEMINI_API_KEY:"";
  if(!provider||!key) return res.status(503).json({error:"AI is not configured. Add AI_PROVIDER and the matching API key to server/.env."});
  const data=req.body;
  const prompt=`You are a spending-insight assistant. Return JSON only with keys title,summary,insights. Each insight has title,severity,insight,recommendation. Do not give professional financial advice. Data: ${JSON.stringify(data)}`;
  try{
    if(provider==="openai"){
      const r=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${key}`},body:JSON.stringify({model:process.env.OPENAI_MODEL||"gpt-4o-mini",messages:[{role:"user",content:prompt}],temperature:.3,response_format:{type:"json_object"}})});
      const j=await r.json(); if(!r.ok) return res.status(r.status).json({error:"OpenAI request failed"});
      return res.json(JSON.parse(j.choices[0].message.content));
    }
    if(provider==="gemini"){
      const model=process.env.GEMINI_MODEL||"gemini-2.0-flash";
      const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{responseMimeType:"application/json"}})});
      const j=await r.json(); if(!r.ok) return res.status(r.status).json({error:"Gemini request failed"});
      return res.json(JSON.parse(j.candidates?.[0]?.content?.parts?.[0]?.text||"{}"));
    }
  }catch(e){return res.status(500).json({error:"AI service unavailable"});}
  return res.status(400).json({error:"Unsupported AI provider"});
});

// React fallback must come after API routes and static assets.
app.get("*",(req,res)=>res.sendFile(path.join(clientDist,"index.html"),(err)=>{
  if(err) res.status(404).send("Frontend build not found. Run: npm run build");
}));

app.listen(process.env.PORT||5000,()=>console.log(`Smart Expense Tracker running on http://localhost:${process.env.PORT||5000}`));