import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
	CallToolRequestSchema,
	ListResourcesRequestSchema,
	ListToolsRequestSchema,
	ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const server = new Server(
	{
		name: "example-servers/postgres",
		version: "0.1.0",
	},
	{
		capabilities: {
			resources: {},
			tools: {},
		},
	},
);

const host = process.env.DB_HOST
const user = process.env.DB_USER
const password = process.env.DB_PASSWORD
const database = process.env.DB_NAME

console.log("values:",
	host, user, password, database
)

const pool = mysql.createPool({
	host, user, password, database
});

server.setRequestHandler(ListResourcesRequestSchema, async () => {

	console.log("values:",
		host, user, password, database
	)
	const conn = await pool.getConnection();
	try {
		const rows = await conn.query(
			"SELECT table_name FROM information_schema.tables WHERE table_schema = ?", [database]
		);
		return {
			resources: rows.map((row) => "TABLE_NAME" in row && ({
				// uri: new URL(`${row.TABLE_NAME}/${SCHEMA_PATH}`, resourceBaseUrl).href,
				uri: new URL(`${row.TABLE_NAME}`).href,
				mimeType: "application/json",
				name: `"${row.TABLE_NAME}" database schema`,
			})),
		};
		// } catch (err) {
		// 	console.log("caught error", err)
		// 	return null
	} finally {
		conn.release();
	}
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {

	console.log("valuueas",
		host, user, password, database
	)
	const resourceUrl = new URL(request.params.uri);

	const pathComponents = resourceUrl.pathname.split("/");
	const tableName = pathComponents.pop();

	const conn = await pool.getConnection();
	try {
		const [rows] = await conn.query(
			"SELECT column_name, data_type FROM information_schema.columns WHERE table_name = ?",
			[tableName],
		);

		return {
			contents: [
				{
					uri: request.params.uri,
					mimeType: "application/json",
					text: JSON.stringify(rows, null, 2),
				},
			],
		};
	} finally {
		conn.release();
	}
});

server.setRequestHandler(ListToolsRequestSchema, async () => {
	return {
		tools: [
			{
				name: "query",
				description: "Run a read-only SQL query",
				inputSchema: {
					type: "object",
					properties: {
						sql: { type: "string" },
					},
				},
			},
		],
	};
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
	if (request.params.name === "query") {
		const sql = request.params.arguments?.sql as string;

		const client = await pool.getConnection()
		try {
			const [rows] = await client.query(sql);
			return {
				content: [{ type: "text", text: JSON.stringify(rows, null, 2) }],
				isError: false,
			};
		} catch (error) {
			return {
				content: "an error occurred, probably invalid query",
				isError: true,
			}
			throw error;
		} finally {
			client
				.query("ROLLBACK")
				.catch((error) =>
					console.warn("Could not roll back transaction:", error),
				);

			client.release();
		}
	}
	throw new Error(`Unknown tool: ${request.params.name}`);
});

async function runServer() {
	const transport = new StdioServerTransport();
	await server.connect(transport);
}

runServer().catch(console.error);
