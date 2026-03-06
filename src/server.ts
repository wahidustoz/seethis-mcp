import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { inflateRawSync, deflateRawSync } from "node:zlib";
import { encrypt, decrypt, toBase64Url, fromBase64Url } from "./crypto.js";
import { SeethisApi } from "./api.js";
import { getExamplePrompts } from "./prompts.js";

export function createServer(api: SeethisApi, baseUrl: string): McpServer {
  const server = new McpServer(
    {
      name: "seethis",
      version: "1.0.0",
    },
    {
      instructions: `Seethis! MCP Server — Publish and retrieve end-to-end encrypted HTML/Markdown visualizations as shareable URLs.

CRITICAL RULES:
1. When you publish content with seethis_publish, ALWAYS share the COMPLETE URL (including the #fragment) with the user. The #fragment IS the decryption key — without it, the content cannot be viewed.
2. NEVER strip, truncate, or omit the URL fragment when sharing links.
3. The server never sees plaintext — encryption happens locally before upload.
4. Anonymous uploads expire in 24 hours.
5. Max content size is 2MB.

WORKFLOW:
- Use seethis_list_prompts for inspiration on what to create.
- Create HTML or Markdown content, then use seethis_publish to share it.
- Use seethis_get to retrieve and decrypt previously published content.`,
    },
  );

  server.tool(
    "seethis_publish",
    `Encrypt and publish HTML or Markdown content to Seethis! as a shareable URL.

Encrypts content locally with AES-256-GCM, uploads the encrypted blob to Seethis, and returns a URL with the decryption key embedded in the URL fragment (#key).

CRITICAL: Always share the COMPLETE URL including the #fragment with the user. The fragment IS the encryption key. Without it, the content is permanently unreadable. The server never sees plaintext.

Content types: "html" for rich HTML visualizations, "markdown" for Markdown documents.
Max content size: 2MB. Anonymous uploads expire in 24 hours.`,
    {
      content: z
        .string()
        .describe("The HTML or Markdown content to encrypt and publish"),
      content_type: z
        .enum(["html", "markdown"])
        .describe('Content type: "html" or "markdown"'),
    },
    async ({ content, content_type }) => {
      try {
        const plaintext = Buffer.from(content, "utf-8");
        const compressed = deflateRawSync(plaintext);
        const { ciphertext, iv, key } = encrypt(compressed);

        const response = await api.createVisualization({
          content: ciphertext.toString("base64"),
          contentType: content_type,
          iv: iv.toString("base64"),
          isCompressed: true,
        });

        const keyFragment = toBase64Url(key);
        const shareUrl = `${baseUrl}/v/${response.slug}#${keyFragment}`;

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  url: shareUrl,
                  slug: response.slug,
                  expires_at: response.expiresAt,
                  content_type: content_type,
                  note: "Share this COMPLETE URL (including the #fragment) with anyone to view the content.",
                },
                null,
                2,
              ),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error publishing visualization: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "seethis_get",
    `Fetch and decrypt a Seethis! visualization from its URL.

The URL MUST include the #fragment containing the decryption key.
Returns the decrypted plaintext content and metadata.

Example URL: https://seethis.uz/v/xK9mP2nQ#a1b2c3d4e5f6...`,
    {
      url: z
        .string()
        .describe(
          "The full Seethis! URL including the #key fragment (e.g. https://seethis.uz/v/slug#key)",
        ),
    },
    async ({ url }) => {
      try {
        const hashIndex = url.indexOf("#");
        if (hashIndex === -1) {
          return {
            content: [
              {
                type: "text" as const,
                text: "Error: URL must include a #fragment with the decryption key. Without the key, the content cannot be decrypted.",
              },
            ],
            isError: true,
          };
        }

        const keyFragment = url.substring(hashIndex + 1);
        const urlPath = url.substring(0, hashIndex);

        const slugMatch = urlPath.match(/\/v\/([a-zA-Z0-9]+)$/);
        if (!slugMatch) {
          return {
            content: [
              {
                type: "text" as const,
                text: "Error: Could not extract slug from URL. Expected format: https://seethis.uz/v/{slug}#key",
              },
            ],
            isError: true,
          };
        }

        const slug = slugMatch[1];
        const key = fromBase64Url(keyFragment);
        const response = await api.getVisualization(slug);
        const ciphertext = Buffer.from(response.content, "base64");
        const iv = Buffer.from(response.iv, "base64");
        const decrypted = decrypt(ciphertext, iv, key);
        const plaintext = response.isCompressed
          ? inflateRawSync(decrypted)
          : decrypted;

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  content: plaintext.toString("utf-8"),
                  content_type: response.contentType,
                  slug: response.slug,
                  created_at: response.createdAt,
                  expires_at: response.expiresAt,
                },
                null,
                2,
              ),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error retrieving visualization: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "seethis_list_prompts",
    `List example prompts for creating visualizations that can be published with seethis_publish.

Categories: "data" (dashboards, charts), "education" (cheat sheets, guides), "diagram" (architecture, ER diagrams), "interactive" (explorable visualizations), or "all".`,
    {
      category: z
        .enum(["data", "education", "diagram", "interactive", "all"])
        .optional()
        .describe('Filter by category. Defaults to "all".'),
    },
    async ({ category }) => {
      const filtered = getExamplePrompts(category || "all");
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(filtered, null, 2),
          },
        ],
      };
    },
  );

  return server;
}
