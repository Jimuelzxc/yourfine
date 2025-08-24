# Introduction

This documentation will guide you through using different tools in our tech stack. Each section explains what the tool is, why we use it, and how you can integrate it into your workflow.

Let’s start with **Zustand**, our state management solution.

---

# Zustand


Zustand is a **small, fast, and scalable state management library** for React.
It has a **simple API based on hooks**, avoids unnecessary boilerplate, and handles common React pitfalls such as:

* Zombie child problems
* React concurrency
* Context loss in mixed renderers

Think of it as **minimal but powerful state management** — easy to learn and hard to outgrow.

---

## Installation

You can install Zustand with npm (or any package manager you prefer):

```bash
# Using NPM
npm install zustand
```

---

## Creating a Store

A store in Zustand is just a **hook**. You can store anything: primitives, objects, or functions.

```javascript
import { create } from 'zustand'

const useStore = create((set) => ({
  bears: 0,
  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  removeAllBears: () => set({ bears: 0 }),
  updateBears: (newBears) => set({ bears: newBears }),
}))
```

---

## Using the Store in Components

Zustand stores can be accessed anywhere in your React app **without providers**.
Components re-render only when the state they use changes.

```javascript
function BearCounter() {
  const bears = useStore((state) => state.bears)
  return <h1>{bears} bears around here...</h1>
}

function Controls() {
  const increasePopulation = useStore((state) => state.increasePopulation)
  return <button onClick={increasePopulation}>one up</button>
}
```

---

✅ That’s all you need to get started!
Zustand keeps your code clean, predictable, and easy to scale as your app grows.

---