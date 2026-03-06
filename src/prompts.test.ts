import { describe, it, expect } from "vitest";
import { getExamplePrompts } from "./prompts.js";

describe("getExamplePrompts", () => {
  it('returns 12 prompts for "all"', () => {
    const prompts = getExamplePrompts("all");
    expect(prompts).toHaveLength(12);
  });

  it("returns 12 prompts with no argument (defaults to all)", () => {
    const prompts = getExamplePrompts();
    expect(prompts).toHaveLength(12);
  });

  it('returns 3 prompts for "data" category', () => {
    const prompts = getExamplePrompts("data");
    expect(prompts).toHaveLength(3);
    expect(prompts.every((p) => p.category === "data")).toBe(true);
  });

  it('returns 4 prompts for "education" category', () => {
    const prompts = getExamplePrompts("education");
    expect(prompts).toHaveLength(4);
    expect(prompts.every((p) => p.category === "education")).toBe(true);
  });

  it('returns 2 prompts for "diagram" category', () => {
    const prompts = getExamplePrompts("diagram");
    expect(prompts).toHaveLength(2);
    expect(prompts.every((p) => p.category === "diagram")).toBe(true);
  });

  it('returns 3 prompts for "interactive" category', () => {
    const prompts = getExamplePrompts("interactive");
    expect(prompts).toHaveLength(3);
    expect(prompts.every((p) => p.category === "interactive")).toBe(true);
  });

  it("every prompt has required fields", () => {
    const prompts = getExamplePrompts("all");
    for (const p of prompts) {
      expect(p).toHaveProperty("title");
      expect(p).toHaveProperty("category");
      expect(p).toHaveProperty("prompt");
      expect(p).toHaveProperty("content_type");
      expect(typeof p.title).toBe("string");
      expect(typeof p.prompt).toBe("string");
      expect(p.title.length).toBeGreaterThan(0);
      expect(p.prompt.length).toBeGreaterThan(0);
    }
  });

  it('content_type is always "html" or "markdown"', () => {
    const prompts = getExamplePrompts("all");
    for (const p of prompts) {
      expect(["html", "markdown"]).toContain(p.content_type);
    }
  });
});
