# Entity Extraction API

A minimal CloudFlare Worker API that extracts specified entities from text using LLM.

## Setup

1. Install dependencies:

```
npm install
```

2. Configure environment variables:

   - For local development, create a `.dev.vars` file in the project root with:
     ```
     LLMFOUNDRY_TOKEN=your_api_token_here
     ```
   - For production, set the `LLMFOUNDRY_TOKEN` in the Cloudflare dashboard

3. Run locally:

```
npm run dev
```

4. Deploy:

```
npm run deploy
```

## API Documentation

The API documentation is available via Swagger UI at:

- Local: http://localhost:8787/docs
- Production: https://[your-worker-subdomain].workers.dev/docs

You can also access the raw OpenAPI specification at `/openapi.json`.

## API Usage

### POST /extract

Extracts specified entities from the input text.

**Request:**

```json
{
  "entities": ["name", "age", "location"],
  "input": "John Doe is 28 years old and lives in New York."
}
```

**Response:**

```json
{
  "name": "John Doe",
  "age": "28",
  "location": "New York"
}
```

If an entity can't be found, its value will be `null`.

## Testing Locally

When running the API locally with `npm run dev`, you can send POST requests to the extract endpoint:

```bash
curl -X POST http://localhost:8787/extract \
  -H "Content-Type: application/json" \
  -d '{"entities": ["name", "age", "location"], "input": "John Doe is 28 years old and lives in New York."}'
```

Expected output:

```json
{
  "name": "John Doe",
  "age": "28",
  "location": "New York"
}
```

### More Examples

#### Extracting contact information:

```bash
curl -X POST http://localhost:8787/extract \
  -H "Content-Type: application/json" \
  -d '{"entities": ["name", "email", "phone", "company"], "input": "My name is Jane Smith. You can reach me at jane.smith@example.com or call me at (555) 123-4567. I work at Acme Corporation."}'
```

Expected output:

```json
{
  "name": "Jane Smith",
  "email": "jane.smith@example.com",
  "phone": "(555) 123-4567",
  "company": "Acme Corporation"
}
```

#### Extracting product information:

```bash
curl -X POST http://localhost:8787/extract \
  -H "Content-Type: application/json" \
  -d '{"entities": ["product_name", "price", "features", "rating"], "input": "The XYZ Pro Camera ($599.99) features 20MP resolution, 4K video, and waterproof design. Customer rating: 4.7/5."}'
```

Expected output:

```json
{
  "product_name": "XYZ Pro Camera",
  "price": "$599.99",
  "features": "20MP resolution, 4K video, and waterproof design",
  "rating": "4.7/5"
}
```

You can also use tools like Postman or Insomnia with the following details:

- URL: `http://localhost:8787/extract`
- Method: `POST`
- Headers:
  - `Content-Type: application/json`
- Body (JSON): Use any of the example payloads above

**Note:** The `LLMFOUNDRY_TOKEN` is automatically used from your `.dev.vars` file when running locally.
