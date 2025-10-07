# Events Lambda Backend

A serverless Python Lambda function for managing events in DynamoDB.

## Features

- **Event Creation**: Create events with auto-generated unique IDs
- **Event Retrieval**: Get all events or specific events by ID
- **Input Validation**: Comprehensive validation for event data
- **Error Handling**: Robust error handling with detailed error messages
- **CORS Support**: Cross-origin resource sharing for web applications

## API Endpoints

### POST /events
Create a new event.

**Request Body:**
```json
{
  "title": "Event Title",
  "description": "Event description",
  "date": "2025-12-25",
  "time": "2:00 PM - 4:00 PM",
  "location": "Event Location",
  "link": "https://example.com/event" // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Event created successfully",
  "event": {
    "id": "event_abc123def456",
    "title": "Event Title",
    "description": "Event description",
    "date": "2025-12-25",
    "time": "2:00 PM - 4:00 PM",
    "location": "Event Location",
    "link": "https://example.com/event",
    "created_at": "2025-10-07T12:00:00.000Z",
    "updated_at": "2025-10-07T12:00:00.000Z"
  }
}
```

### GET /events
Retrieve all events.

**Response:**
```json
{
  "success": true,
  "events": [...],
  "count": 10
}
```

### GET /events/{id}
Retrieve a specific event by ID.

**Response:**
```json
{
  "success": true,
  "event": {...}
}
```

## DynamoDB Schema

**Table Name:** `events-table`

**Primary Key:** `id` (String) - Auto-generated unique identifier

**Attributes:**
- `id`: Event ID (partition key)
- `title`: Event title
- `description`: Event description
- `date`: Event date (YYYY-MM-DD format)
- `time`: Event time
- `location`: Event location
- `link`: Optional event link
- `created_at`: ISO timestamp of creation
- `updated_at`: ISO timestamp of last update

## Deployment

### Prerequisites
- AWS CLI configured
- Terraform installed (for infrastructure)
- Python 3.11

### Manual Deployment
1. Install dependencies:
   ```bash
   pip install -r requirements.txt -t .
   ```

2. Create deployment package:
   ```bash
   zip -r lambda_function.zip .
   ```

3. Deploy using AWS CLI:
   ```bash
   aws lambda create-function \
     --function-name events-api \
     --runtime python3.11 \
     --role arn:aws:iam::YOUR_ACCOUNT:role/lambda-execution-role \
     --handler lambda_function.lambda_handler \
     --zip-file fileb://lambda_function.zip
   ```

### Terraform Deployment
1. Initialize Terraform:
   ```bash
   cd terraform
   terraform init
   ```

2. Plan deployment:
   ```bash
   terraform plan
   ```

3. Apply infrastructure:
   ```bash
   terraform apply
   ```

## Environment Variables

- `DYNAMODB_TABLE_NAME`: Name of the DynamoDB table (default: "events-table")

## Error Handling

The function includes comprehensive error handling for:
- Invalid JSON in request body
- Missing required fields
- Invalid date/time formats
- DynamoDB errors
- General server errors

All errors return appropriate HTTP status codes and detailed error messages.

## CORS Configuration

The function includes CORS headers to allow cross-origin requests from web applications:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Headers: Content-Type`
- `Access-Control-Allow-Methods: POST, GET, OPTIONS`

## Testing

Run local tests:
```bash
python test_lambda.py
```

Note: Local tests require DynamoDB to be configured for full functionality.

## Security Considerations

- The function uses IAM roles for DynamoDB access
- Input validation prevents malformed data
- Error messages don't expose sensitive information
- CORS is configured appropriately for the frontend domain

## Performance

- Uses DynamoDB's PAY_PER_REQUEST billing mode
- Includes a Global Secondary Index on date for efficient querying
- Lambda timeout set to 30 seconds
- Efficient error handling and validation