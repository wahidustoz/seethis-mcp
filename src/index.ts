#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SeethisApi } from "./api.js";
import { createServer } from "./server.js";

const API_URL = process.env.SEETHIS_API_URL || "https://api.seethis.uz";
const BASE_URL = process.env.SEETHIS_BASE_URL || "https://seethis.uz";

const api = new SeethisApi(API_URL);
const server = createServer(api, BASE_URL);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
