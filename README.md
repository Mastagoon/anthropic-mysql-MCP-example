# Mysql MCP example - Anthropic AI

A lightweight setup for querying a MySQL database via the [Model Context Protocol (MCP)](https://github.com/modelcontextprotocol), with a CLI powered by Anthropic for natural language interaction.
Inspired by this [Postgresql MCP example](https://github.com/modelcontextprotocol/servers/tree/main/src/postgres)

## 📁 Project Structure
.
├── client/ # very simple CLI tool using Anthropic to query the server, or you could use [Claude Desktop](https://modelcontextprotocol.io/quickstart/user)
└── server/ # MCP server backed by a MySQL database


---

## 🧠 How It Works

- **server/**: Runs an MCP-compliant server exposing your MySQL database. It serves schema metadata and allows SQL queries.
- **client/**: A minimal CLI wrapper that sends natural language prompts to Anthropic, which in turn uses MCP tools to generate and run SQL queries.

---

## 🚀 Getting Started

### [Using Claude Desktop](https://modelcontextprotocol.io/quickstart/user)

### Using the basic cli client on this repo:

#### 1. Set Up Environment Variables

Create a `.env` file (or export vars manually) in `server/` with your MySQL credentials:

```bash
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=your_database
```

For the client environment variables:

```bash
API_KEY=anthropic api key
```

#### 2. Transpile both server and client to javascript

```bash
cd server
pnpm build
or yarn build
or npm run build
or whatever kids do these days

cd ../client
pnpm build
```
#### 3. Run the client (using the cli client)
```bash
node build/index.js ../server/build/index.js
```




