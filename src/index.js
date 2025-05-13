export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle CORS preflight requests
    if (request.method === "OPTIONS") {
      return handleCors();
    }
    
    // Handle extract endpoint
    if (request.method === "POST" && url.pathname === "/extract") {
      return handleExtract(request);
    }
    
    // Return 404 for all other routes
    return new Response("Not Found", { status: 404 });
  },
};

async function handleExtract(request) {
  try {
    const body = await request.json();
    
    // Validate request body
    if (!body.entities || !Array.isArray(body.entities) || !body.input) {
      return new Response(
        JSON.stringify({ error: "Invalid request body. Expected 'entities' array and 'input' string." }),
        { 
          status: 400,
          headers: corsHeaders()
        }
      );
    }
    
    // Get authorization header from the request
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header. Please include 'Authorization: Bearer YOUR_TOKEN'" }),
        { 
          status: 401,
          headers: corsHeaders()
        }
      );
    }
    
    // Prepare the prompt for GPT 4.1 mini
    const prompt = createExtractionPrompt(body.entities, body.input);
    
    // Call GPT 4.1 mini API with the authorization header
    const extractedData = await callGptApi(prompt, authHeader);
    
    return new Response(
      JSON.stringify(extractedData),
      { 
        status: 200,
        headers: corsHeaders()
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Internal Server Error" }),
      { 
        status: 500,
        headers: corsHeaders()
      }
    );
  }
}

function createExtractionPrompt(entities, input) {
  return [
    {
      role: "system",
      content: `You are an AI assistant that extracts specific information from text. 
Extract ONLY the following entities: ${entities.join(", ")}.
Respond with a valid JSON object with the extracted entities as keys. 
If an entity cannot be found, set its value to null.`
    },
    {
      role: "user",
      content: input
    }
  ];
}

async function callGptApi(messages, authHeader) {
  const response = await fetch("https://llmfoundry.straive.com/openai/v1/chat/completions", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "Authorization": authHeader
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      messages: messages,
      temperature: 0.1
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API request failed: ${error}`);
  }
  
  const jsonResponse = await response.json();
  
  try {
    // Parse the content response as JSON
    return JSON.parse(jsonResponse.choices[0].message.content);
  } catch (error) {
    // If parsing fails, return the raw content
    return { raw: jsonResponse.choices[0].message.content };
  }
}

function corsHeaders() {
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
}

function handleCors() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders()
  });
} 