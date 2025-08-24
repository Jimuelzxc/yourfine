
# Gemini API – Text Generation

The **Gemini API** allows you to generate text outputs from a variety of inputs, including **text, images, video, and audio**, using Gemini models. This guide focuses on generating text from a simple text input.

---

## Installation

Install the Gemini SDK via npm:

```bash
npm install @google/genai
```

---

## Basic Usage

Here’s an example of generating text using the `gemini-2.5-flash` model:

```javascript
import { GoogleGenAI } from "@google/genai";

// Initialize the AI client
const ai = new GoogleGenAI({});

async function main() {
  // Generate content with the Gemini model
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Hello there",
    config: {
      systemInstruction: "You are a cat. Your name is Neko.",
    },
  });

  console.log(response.text);
}

// Run the example
await main();
```

---

### How it works

1. **Initialize the client** – `GoogleGenAI({})` creates a connection to the Gemini API.
2. **Call `generateContent`** – specify the model, your input text, and any system instructions.
3. **Read the response** – `response.text` contains the generated output.

---

This is the basic setup. From here, you can experiment with different **models, input types, and system instructions** to customize your outputs.

---

If you want, I can also **add a “Tips for Agents” section** that explains how to structure system instructions and inputs for best results with Gemini. It would make this guide much more practical for daily use. Do you want me to do that?
