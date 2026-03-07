import { NextResponse } from "next/server";
import { tavily } from "@tavily/core";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { firestore } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const { idea } = await req.json();

    if (!idea) {
      return NextResponse.json({ error: "Idea is required" }, { status: 400 });
    }

    if (!process.env.TAVILY_API_KEY || !process.env.GEMINI_API_KEY) {
      console.warn("API keys not found, using mocked response.");
      // Fallback artificial delay to simulate searching and LLM generation
      await new Promise((resolve) => setTimeout(resolve, 4000));
      return NextResponse.json({
        uniquenessScore: 5,
        pivot: "Currently running in mock mode. Add TAVILY_API_KEY and GEMINI_API_KEY to see real insights! For now, consider targeting hamsters.",
        weekendStack: ["Next.js", "Mock Data", "Tailwind CSS"],
        sources: [{ title: "Mock Source", url: "https://example.com" }]
      });
    }

    // Step 1: Web Search for Competitors and Similar Projects
    const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
    let searchContext = "";
    let sources: { title: string; url: string }[] = [];
    try {
      const searchResponse = await tvly.search(idea, {
        searchDepth: "basic",
        includeImages: false,
        includeAnswer: false,
        includeRawContent: false,
        maxResults: 5,
      });
      searchContext = searchResponse.results.map(r => `- ${r.title}: ${r.content}`).join("\n");
      sources = searchResponse.results.map(r => ({ title: r.title, url: r.url }));
    } catch (e) {
      console.error("Tavily Search Error:", e);
      searchContext = "Failed to fetch web results. Proceed with general knowledge.";
    }

    // Step 2: Gemini 2.5 Flash Analysis
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash", 
      generationConfig: { responseMimeType: "application/json" } 
    });

    const prompt = `
    You are a brutal but brilliant Product Engineer AI evaluating a user's "messy shower thought" for a new project/app.
    
    User Idea: "${idea}"
    
    Recent Web Search Results (Competitors/Similar Projects):
    ${searchContext}
    
    Analyze the idea and provide a strict JSON response with the following schema:
    {
      "uniquenessScore": <number from 1 to 10. 1 means cloning a saturated market, 10 means paradigm-shifting novelty.>,
      "pivot": "<string. A brutal, truthful, but ultimately helpful suggestion on how to make this idea 10x cooler, more niche, or more viable.>",
      "weekendStack": ["<string>", "<string>", "<string>"] <Array of 3 to 5 specific, modern tech stack choices to build the MVP this weekend>
    }
    
    Make the pivot sound gritty, "Dark Mode Cyber-Academic", and highly opinionated. Be concise.
    `;

    const result = await model.generateContent(prompt);
    let responseText = result.response.text();
    
    // Strip markdown code blocks if the model wrapped the JSON
    if (responseText.startsWith("```json")) {
      responseText = responseText.replace(/^```json/, "").replace(/```$/, "").trim();
    } else if (responseText.startsWith("```")) {
      responseText = responseText.replace(/^```/, "").replace(/```$/, "").trim();
    }
    
    try {
      const jsonResponse = JSON.parse(responseText);
      const finalData = {
        idea,
        ...jsonResponse,
        sources,
        createdAt: new Date().toISOString()
      };

      // Step 3: Save to Firestore
      try {
        await firestore.collection("validations").add(finalData);
      } catch (dbError) {
        console.error("Firestore Error:", dbError);
        // We still return the data even if DB saving fails
      }

      return NextResponse.json(finalData);
    } catch (parseError) {
      console.error("Failed to parse Gemini JSON:", responseText);
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

  } catch (error) {
    console.error("API Error", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

