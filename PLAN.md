# Prompt Library & Refinement App (v1.0)

## Overview

An open-source web app for saving, refining, and reusing prompts.\
The goal: help users keep track of their best prompts and clean up messy
inputs with LLM-powered refinement.

------------------------------------------------------------------------

## Core Features (v1.0)

1. ### **Prompt Input**
   * User types messy prompt in the input box.
   
   * Two main actions:
     
     * **Refine** → Runs input through LLM for refinement.
       
       * Input toggles between _original_ and _refined_ when clicked.
       
       * User then clicks **Save** to store the prompt (both original + refined are saved together).
     
     * **Save/Send** → If no refinement is done, this saves the **original version only** into history.
2. **Prompt History**
   - Saved prompts are displayed in a scrollable list (show 3 at a
     time, scroll for more).\
   - Newest prompt appears at the bottom (view auto-scrolls down).\
   - Each card stores:
     - `original` (messy version)
     - `refined` (if available)
   - Default view shows the **refined version**.\
   - **Long press** on card toggles refined ↔ original.\
   - Clicking the card copies the prompt text.
3. **API Key**
   - User provides their own LLM API key (OpenAI, Anthropic, etc.).\
   - Stored in `localStorage` so it persists between sessions.

------------------------------------------------------------------------

## Data Structure (localStorage)

Each saved prompt object includes:

```json
{
  "id": "uuid-or-timestamp",
  "original": "the messy input",
  "refined": "the refined version",
  "timestamp": "2025-08-23T12:34:56"
}
```

------------------------------------------------------------------------

## Future Ideas (Later Versions)

- **Modes**: Concise, Expanded, Goal-Focused refinements.
- **Tags/Categories** for organization.
- **Search & Filters** to quickly find prompts.
- **Prompt Sets/Chains** (group related prompts).
- **Settings** page for key management & customization.

------------------------------------------------------------------------

## Design Notes

- Keep UI minimal:
  - Input box at bottom.\
  - History above, always focused on latest entry.\
  - Scrollable with smooth anchoring to bottom.\
- History shows only a few prompts at once to avoid overwhelm.
- Open-source and lightweight, no backend required (all localStorage).


