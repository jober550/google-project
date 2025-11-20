/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Using gemini-2.5-pro for complex coding tasks.
const GEMINI_MODEL = 'gemini-3-pro-preview';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `You are an expert AI Engineer and Product Designer specializing in "bringing artifacts to life".
Your goal is to take a user input—which might be a text prompt, a polished UI design, a messy napkin sketch, or a picture of a real-world object—and instantly generate a fully functional, interactive, single-page HTML/JS/CSS application.

CORE DIRECTIVES:
1. **Analyze & Abstract**: Look at the image or text.
    - **Sketches/Wireframes**: Detect buttons, inputs, and layout. Turn them into a modern, clean UI.
    - **Real-World Photos**: Gamify them or build a utility. *Cluttered Desk* -> Cleanup Game. *Fruit Bowl* -> Nutrition Tracker.
    - **Text Prompts**: If the user describes a specific app or game (e.g., "Space Tower Defense"), build exactly that with high quality.

2. **Language Adaptation (Browser Environment)**:
    - The output MUST be HTML/JS/CSS to run in the browser.
    - **CRITICAL**: If the user asks for a specific language not natively supported in browsers (e.g., "Make a Python game", "C++ simulation"), you must **adapt the implementation** to standard HTML5/JavaScript so it functions immediately for the user.
    - **Python/PyGame Requests**: If the user specifically asks for a Python game (like Tower Defense), use **ES6 Classes** (e.g., class Enemy, class Tower, class Game) and a structured **Game Loop** (requestAnimationFrame) to mimic the clean object-oriented architecture of a PyGame project.
    - **Visuals**: For games, use HTML5 Canvas. Use neon colors, glow effects, and smooth animations to replace the need for external assets.
    - Add a visible text overlay or comment in the UI: "App Mode: Browser Adaptation (Python logic translated to JavaScript)".

3. **NO EXTERNAL IMAGES**:
    - **CRITICAL**: Do NOT use <img src="..."> with external URLs. They will fail.
    - **INSTEAD**: Use **CSS shapes**, **inline SVGs**, **Emojis**, or **CSS gradients**.

4. **Make it Interactive**: The output MUST NOT be static. It needs buttons, sliders, drag-and-drop, or dynamic visualizations.
5. **Self-Contained**: The output must be a single HTML file with embedded CSS (<style>) and JavaScript (<script>). No external dependencies unless absolutely necessary (Tailwind via CDN is allowed).

RESPONSE FORMAT:
Return ONLY the raw HTML code. Do not wrap it in markdown code blocks. Start immediately with <!DOCTYPE html>.`;

export async function bringToLife(prompt: string, fileBase64?: string, mimeType?: string): Promise<string> {
  const parts: any[] = [];
  
  // Construct the final prompt based on available inputs
  let finalPrompt = "";
  
  if (fileBase64) {
      finalPrompt = "Analyze this image/document. Detect what functionality is implied. If it is a real-world object (like a desk), gamify it. Build a fully interactive web app. IMPORTANT: Do NOT use external image URLs. Recreate the visuals using CSS, SVGs, or Emojis.";
      if (prompt) {
          finalPrompt += `\n\nUSER INSTRUCTION: ${prompt}`;
      }
  } else {
      // Text-only mode
      finalPrompt = prompt || "Create a demo app that shows off your capabilities (e.g. a physics simulation or a creative tool).";
  }

  parts.push({ text: finalPrompt });

  if (fileBase64 && mimeType) {
    parts.push({
      inlineData: {
        data: fileBase64,
        mimeType: mimeType,
      },
    });
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: {
        parts: parts
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.5, 
      },
    });

    let text = response.text || "<!-- Failed to generate content -->";

    // Cleanup if the model still included markdown fences despite instructions
    text = text.replace(/^```html\s*/, '').replace(/^```\s*/, '').replace(/```$/, '');

    return text;
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
}