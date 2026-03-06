export interface ExamplePrompt {
  title: string;
  category: string;
  prompt: string;
  content_type: "html" | "markdown";
}

const prompts: ExamplePrompt[] = [
  {
    title: "Interactive Sorting Visualizer",
    category: "interactive",
    prompt:
      "Create an interactive HTML page that visualizes bubble sort, merge sort, and quicksort with animated colored bars. Include play/pause, step, and speed controls. Show comparison count and swap count in real-time.",
    content_type: "html",
  },
  {
    title: "Binary Tree Traversal Explorer",
    category: "interactive",
    prompt:
      "Build an HTML visualization of a binary tree where users can click to add/remove nodes and watch BFS, DFS (pre/in/post-order) traversals animate step-by-step, highlighting each visited node.",
    content_type: "html",
  },
  {
    title: "Microservices Architecture Diagram",
    category: "diagram",
    prompt:
      "Create an HTML diagram showing a microservices architecture with an API gateway, auth service, user service, order service, notification service, and message queue. Use CSS-styled boxes with colored borders, connection lines, and data flow arrows.",
    content_type: "html",
  },
  {
    title: "Database Schema Visualization",
    category: "diagram",
    prompt:
      "Create an HTML entity-relationship diagram for an e-commerce system showing tables (users, products, orders, order_items, reviews) with columns, types, primary keys, and foreign key relationships drawn as lines between tables.",
    content_type: "html",
  },
  {
    title: "Algorithm Complexity Cheat Sheet",
    category: "education",
    prompt:
      "Create an HTML reference card showing Big-O complexities of common data structures and algorithms. Include a visual graph comparing O(1), O(log n), O(n), O(n log n), O(n^2) growth curves, plus a table of sorting algorithms with their best/avg/worst cases.",
    content_type: "html",
  },
  {
    title: "CSS Flexbox Visual Guide",
    category: "education",
    prompt:
      "Build an interactive HTML page that demonstrates all CSS Flexbox properties. Show colored boxes that rearrange live as users toggle flex-direction, justify-content, align-items, flex-wrap, and gap values via buttons.",
    content_type: "html",
  },
  {
    title: "Real-Time Dashboard Mockup",
    category: "data",
    prompt:
      "Create an HTML dashboard with 4 metric cards (revenue, users, orders, conversion rate), a line chart showing 7-day trends using SVG, a bar chart of top products, and a recent activity feed. Use a dark theme with accent colors.",
    content_type: "html",
  },
  {
    title: "Data Pipeline Flow Diagram",
    category: "data",
    prompt:
      "Create an HTML visualization of a data pipeline: source databases -> ingestion (Kafka) -> processing (Spark) -> data warehouse -> BI dashboards. Show data flowing through animated dashed lines between styled component boxes.",
    content_type: "html",
  },
  {
    title: "Project Comparison Matrix",
    category: "data",
    prompt:
      "Create an HTML comparison table for 4 JavaScript frameworks (React, Vue, Angular, Svelte) across categories: learning curve, performance, ecosystem, bundle size, TypeScript support. Use colored rating indicators and a weighted score summary.",
    content_type: "html",
  },
  {
    title: "Git Workflow Cheat Sheet",
    category: "education",
    prompt:
      "Create a Markdown cheat sheet covering common Git workflows: feature branch flow, git rebase vs merge, cherry-pick, interactive rebase, stashing, and conflict resolution. Include command examples and diagrams using ASCII art.",
    content_type: "markdown",
  },
  {
    title: "API Documentation Template",
    category: "education",
    prompt:
      "Create a Markdown API documentation page for a REST API with endpoints for user CRUD operations. Include request/response examples, authentication headers, error codes, and rate limiting details in a clean, organized format.",
    content_type: "markdown",
  },
  {
    title: "Neural Network Architecture Visualizer",
    category: "interactive",
    prompt:
      "Create an HTML visualization of a neural network with input, hidden, and output layers. Draw neurons as circles connected by lines. Allow clicking neurons to highlight their connections, and show weights on hover.",
    content_type: "html",
  },
];

export function getExamplePrompts(
  category: string = "all",
): ExamplePrompt[] {
  if (category === "all") return prompts;
  return prompts.filter((p) => p.category === category);
}
