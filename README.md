# seethis-mcp

MCP server for [Seethis!](https://seethis.uz) — Publish and retrieve **end-to-end encrypted** HTML/Markdown visualizations as shareable URLs.

Content is encrypted locally with AES-256-GCM before upload. The server never sees plaintext. The decryption key lives only in the URL fragment (`#key`), which is never sent to the server.

## Quick Start

```bash
npx seethis-mcp
```

## Configuration

### Claude Code

```bash
claude mcp add seethis-mcp -- npx seethis-mcp
```

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "seethis": {
      "command": "npx",
      "args": ["seethis-mcp"]
    }
  }
}
```

### Generic MCP Client

```json
{
  "command": "npx",
  "args": ["seethis-mcp"],
  "transport": "stdio"
}
```

## Tools

### `seethis_publish`

Encrypt and publish HTML or Markdown content as a shareable URL.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `content` | `string` | Yes | The HTML or Markdown content to encrypt and publish |
| `content_type` | `"html" \| "markdown"` | Yes | Content type |

Returns a JSON object with `url`, `slug`, `expires_at`, `content_type`, and a reminder to share the complete URL.

### `seethis_get`

Fetch and decrypt a previously published visualization.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | `string` | Yes | The full Seethis URL including the `#key` fragment |

Returns the decrypted content and metadata.

### `seethis_list_prompts`

List example prompts for creating visualizations.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `category` | `"data" \| "education" \| "diagram" \| "interactive" \| "all"` | No | Filter by category (defaults to `"all"`) |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SEETHIS_API_URL` | `https://api.seethis.uz` | Backend API URL |
| `SEETHIS_BASE_URL` | `https://seethis.uz` | Frontend base URL for generated links |

## How Encryption Works

1. Content is compressed with DEFLATE
2. A random 256-bit AES key and 96-bit IV are generated
3. Content is encrypted with AES-256-GCM (authenticated encryption)
4. The encrypted blob + IV are uploaded to the server
5. The key is encoded as base64url and placed in the URL fragment (`#key`)
6. The URL fragment is never sent to the server — decryption happens entirely in the client

## Notes

- Anonymous uploads expire after **24 hours**
- Maximum content size: **2 MB**
- The `#fragment` in the URL **is** the decryption key — always share the complete URL
- The server never sees plaintext content

## License

MIT
