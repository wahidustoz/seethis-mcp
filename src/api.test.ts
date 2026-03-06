import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { SeethisApi } from "./api.js";

describe("SeethisApi", () => {
  const baseUrl = "https://api.example.com";
  let api: SeethisApi;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    api = new SeethisApi(baseUrl);
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("createVisualization", () => {
    it("POSTs to /api/v1/viz with correct body", async () => {
      const responseData = {
        slug: "abc123",
        url: "https://seethis.uz/v/abc123",
        expiresAt: "2026-03-06T00:00:00Z",
      };
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(responseData),
      });

      const request = {
        content: "encrypted-base64",
        contentType: "html",
        iv: "iv-base64",
      };
      const result = await api.createVisualization(request);

      expect(fetchMock).toHaveBeenCalledWith(`${baseUrl}/api/v1/viz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });
      expect(result).toEqual(responseData);
    });

    it("throws on 400 with status in message", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: () => Promise.resolve("Bad Request"),
      });

      await expect(
        api.createVisualization({
          content: "x",
          contentType: "html",
          iv: "y",
        }),
      ).rejects.toThrow("400");
    });

    it("throws on 429 rate limit", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 429,
        text: () => Promise.resolve("Too Many Requests"),
      });

      await expect(
        api.createVisualization({
          content: "x",
          contentType: "html",
          iv: "y",
        }),
      ).rejects.toThrow("429");
    });

    it("throws on 500 server error", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve("Internal Server Error"),
      });

      await expect(
        api.createVisualization({
          content: "x",
          contentType: "html",
          iv: "y",
        }),
      ).rejects.toThrow("500");
    });
  });

  describe("getVisualization", () => {
    it("GETs /api/v1/viz/{slug} and returns parsed response", async () => {
      const responseData = {
        slug: "abc123",
        content: "encrypted-base64",
        contentType: "html",
        iv: "iv-base64",
        createdAt: "2026-03-05T00:00:00Z",
        expiresAt: "2026-03-06T00:00:00Z",
      };
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(responseData),
      });

      const result = await api.getVisualization("abc123");

      expect(fetchMock).toHaveBeenCalledWith(`${baseUrl}/api/v1/viz/abc123`);
      expect(result).toEqual(responseData);
    });

    it("throws on 404", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: () => Promise.resolve("Not Found"),
      });

      await expect(api.getVisualization("nonexistent")).rejects.toThrow("404");
    });
  });
});
