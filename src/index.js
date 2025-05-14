// Import OpenAPI spec and Swagger UI HTML
import openApiSpec from "./openapi.json";
import swaggerHtml from "./swagger.html";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Handle CORS preflight requests
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders() });

    // Handle extract endpoint
    if (request.method === "POST" && url.pathname === "/extract") return handleExtract(request, env);

    // Serve OpenAPI spec
    if (request.method === "GET" && url.pathname === "/openapi.json")
      return new Response(openApiSpec, { headers: { "Content-Type": "application/json" } });

    // Serve Swagger UI
    if (request.method === "GET" && (url.pathname === "/docs" || url.pathname === "/"))
      return new Response(swaggerHtml, { headers: { "Content-Type": "text/html" } });

    // Return 404 for all other routes
    return new Response("Not Found", { status: 404 });
  },
};

async function handleExtract(request, env) {
  try {
    const body = await request.json();

    // Validate request body
    if (!body.entities || !Array.isArray(body.entities) || !body.input)
      return new Response(
        JSON.stringify({ error: "Invalid request body. Expected 'entities' array and 'input' string." }),
        { status: 400, headers: corsHeaders() },
      );

    // Prepare prompt and call API
    const prompt = createExtractionPrompt(body.entities, body.input);
    const extractedData = await callGptApi(prompt, env.LLMFOUNDRY_TOKEN);

    return new Response(JSON.stringify(extractedData), { status: 200, headers: corsHeaders() });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), {
      status: 500,
      headers: corsHeaders(),
    });
  }
}

function createExtractionPrompt(entities, input) {
  return [
    {
      role: "system",
      content: `You are an AI assistant that extracts specific information from text.
Extract ONLY the following entities: ${entities.join(", ")}.
Respond with a valid JSON object with the extracted entities as keys.
If an entity cannot be found, set its value to null.`,
    },
    {
      role: "user",
      content: input,
    },
  ];
}

async function callGptApi(messages, authToken) {
  const response = await fetch("https://llmfoundry.straive.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
    body: JSON.stringify({ model: "gpt-4.1-mini", messages }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API request failed: ${error}`);
  }

  const jsonResponse = await response.json();

  try {
    return JSON.parse(jsonResponse.choices[0].message.content);
  } catch (error) {
    return { raw: jsonResponse.choices[0].message.content };
  }
}

function corsHeaders() {
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}
