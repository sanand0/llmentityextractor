# Entity Extraction API

A minimal CloudFlare Worker API that extracts specified entities from text using LLM.

## Setup

1. Install dependencies:
```
npm install
```

2. Run locally:
```
npm run dev
```

3. Deploy:
```
npm run deploy
```

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
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"entities": ["name", "age", "location"], "input": "John Doe is 28 years old and lives in New York."}'
```

You can also use tools like Postman or Insomnia with the following details:

- URL: `http://localhost:8787/extract`
- Method: `POST`
- Headers:
  - `Content-Type: application/json`
  - `Authorization: Bearer YOUR_TOKEN`
- Body (JSON):
```json
{
  "entities": ["name", "age", "location"],
  "input": "John Doe is 28 years old and lives in New York."
}
```

Replace `YOUR_TOKEN` with your actual API token. 