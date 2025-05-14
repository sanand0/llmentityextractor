# Entity Extraction API

A minimal CloudFlare Worker API that extracts specified entities from text using LLM.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.dev.vars` file in the project root with an [LLM Foundry token](https://llmfoundry.straive.com/code).

   ```ini
   LLMFOUNDRY_TOKEN=...
   ```

3. Run locally:

   ```bash
   npm run dev
   ```

4. Deploy to Cloudflare:

   ```bash
   # Add secrets to production -- one-time
   npx wrangler secret put LLMFOUNDRY_TOKEN

   # Deploy
   npm run deploy
   ```

5. Test:

   ```bash
   curl -X POST http://llmentityextractor.sanand0.workers.dev/extract \
     -H "Content-Type: application/json" \
     -d '{"entities": ["name", "age", "location"], "input": "John Doe is 28 years old and lives in New York."}'
   ```

## API Documentation

The API documentation is available via Swagger UI at:

- Local: http://localhost:8787/
- Production: https://llmentityextractor.sanand0.workers.dev/

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
