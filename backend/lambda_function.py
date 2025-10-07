import json
import boto3
import uuid
import logging
import os
from datetime import datetime
from typing import Dict, Any, Optional
from botocore.exceptions import ClientError

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')
table_name = os.environ.get('DYNAMODB_TABLE_NAME', 'events-table')
table = dynamodb.Table(table_name)

# CORS headers for all responses
CORS_HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS'
}

def generate_event_id() -> str:
    """Generate a unique event ID using UUID4"""
    return f"event_{uuid.uuid4().hex[:12]}"

def validate_event_data(event_data: Dict[str, Any]) -> tuple[bool, Optional[str]]:
    """
    Validate event data structure and required fields
    Returns: (is_valid, error_message)
    """
    required_fields = ['title', 'description', 'date', 'time', 'location']

    # Check if all required fields are present
    for field in required_fields:
        if field not in event_data or not event_data[field]:
            return False, f"Missing required field: {field}"

    # Validate date format (YYYY-MM-DD)
    try:
        datetime.strptime(event_data['date'], '%Y-%m-%d')
    except ValueError:
        return False, "Invalid date format. Use YYYY-MM-DD"

    # Validate time format (HH:MM or HH:MM AM/PM or time range)
    if not event_data['time'].strip():
        return False, "Time field cannot be empty"

    # Optional link validation
    if 'link' in event_data and event_data['link']:
        link = event_data['link'].strip()
        if link and not (link.startswith('http://') or link.startswith('https://')):
            return False, "Link must be a valid URL starting with http:// or https://"

    return True, None

def create_response(status_code: int, body: Dict[str, Any], additional_headers: Dict[str, str] = None) -> Dict[str, Any]:
    """
    Create a standardized API Gateway proxy response
    """
    headers = CORS_HEADERS.copy()
    if additional_headers:
        headers.update(additional_headers)

    return {
        'statusCode': status_code,
        'headers': headers,
        'body': json.dumps(body, default=str)  # default=str handles datetime serialization
    }

def create_event(event_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Create a new event in DynamoDB
    """
    try:
        # Validate input data
        is_valid, error_message = validate_event_data(event_data)
        if not is_valid:
            return create_response(400, {
                'error': 'Validation failed',
                'message': error_message
            })

        # Generate unique ID
        event_id = generate_event_id()

        # Prepare item for DynamoDB
        item = {
            'id': event_id,
            'title': event_data['title'].strip(),
            'description': event_data['description'].strip(),
            'date': event_data['date'].strip(),
            'time': event_data['time'].strip(),
            'location': event_data['location'].strip(),
            'link': event_data.get('link', '').strip(),
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }

        # Save to DynamoDB
        table.put_item(Item=item)

        logger.info(f"Event created successfully with ID: {event_id}")

        return create_response(201, {
            'success': True,
            'message': 'Event created successfully',
            'event': item
        })

    except ClientError as e:
        logger.error(f"DynamoDB error: {e}")
        return create_response(500, {
            'error': 'Database error',
            'message': 'Failed to save event to database'
        })
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return create_response(500, {
            'error': 'Internal server error',
            'message': 'An unexpected error occurred'
        })

def get_events(query_params: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Retrieve events from DynamoDB with optional filtering
    """
    try:
        # Basic scan operation (can be optimized with indexes for large datasets)
        response = table.scan()
        events = response.get('Items', [])

        # Sort events by date
        events.sort(key=lambda x: x.get('date', ''))

        logger.info(f"Retrieved {len(events)} events")

        return create_response(200, {
            'success': True,
            'events': events,
            'count': len(events)
        })

    except ClientError as e:
        logger.error(f"DynamoDB error: {e}")
        return create_response(500, {
            'error': 'Database error',
            'message': 'Failed to retrieve events from database'
        })
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return create_response(500, {
            'error': 'Internal server error',
            'message': 'An unexpected error occurred'
        })

def get_event_by_id(event_id: str) -> Dict[str, Any]:
    """
    Retrieve a specific event by its ID
    """
    try:
        response = table.get_item(Key={'id': event_id})

        if 'Item' not in response:
            return create_response(404, {
                'error': 'Event not found',
                'message': f'No event found with ID: {event_id}'
            })

        return create_response(200, {
            'success': True,
            'event': response['Item']
        })

    except ClientError as e:
        logger.error(f"DynamoDB error: {e}")
        return create_response(500, {
            'error': 'Database error',
            'message': 'Failed to retrieve event from database'
        })
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return create_response(500, {
            'error': 'Internal server error',
            'message': 'An unexpected error occurred'
        })

def delete_event(event_id: str) -> Dict[str, Any]:
    """
    Delete a specific event by its ID from DynamoDB
    """
    try:
        # First check if the event exists
        response = table.get_item(Key={'id': event_id})

        if 'Item' not in response:
            return create_response(404, {
                'error': 'Event not found',
                'message': f'No event found with ID: {event_id}'
            })

        # Delete the event
        table.delete_item(Key={'id': event_id})

        logger.info(f"Event deleted successfully with ID: {event_id}")

        return create_response(200, {
            'success': True,
            'message': f'Event {event_id} deleted successfully'
        })

    except ClientError as e:
        logger.error(f"DynamoDB error: {e}")
        return create_response(500, {
            'error': 'Database error',
            'message': 'Failed to delete event from database'
        })
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return create_response(500, {
            'error': 'Internal server error',
            'message': 'An unexpected error occurred'
        })

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Main Lambda handler function for API Gateway proxy integration
    """
    try:
        # Log the incoming event for debugging
        logger.info(f"Received event: {json.dumps(event, default=str)}")

        # Get HTTP method and path from API Gateway proxy event
        http_method = event.get('httpMethod', 'GET')
        path = event.get('path', '/')
        query_params = event.get('queryStringParameters') or {}
        headers = event.get('headers', {})

        # Normalize path to handle API Gateway stage prefixes
        if path.startswith('/prod/') or path.startswith('/dev/') or path.startswith('/test/'):
            path = '/' + '/'.join(path.split('/')[2:])

        logger.info(f"Processing {http_method} request to {path}")
        logger.info(f"Query params: {query_params}")
        logger.info(f"Headers: {headers}")

        # Handle CORS preflight requests
        if http_method == 'OPTIONS':
            return create_response(200, {'message': 'CORS preflight successful'})

        # Route requests based on method and path
        if http_method == 'POST' and (path.endswith('/eventcalendar') or path.endswith('/events')):
            # Create new event
            try:
                request_body = event.get('body', '{}')
                if request_body is None:
                    request_body = '{}'

                # Handle base64 encoded body from API Gateway
                if event.get('isBase64Encoded', False):
                    import base64
                    request_body = base64.b64decode(request_body).decode('utf-8')

                body = json.loads(request_body)
                logger.info(f"Request body: {body}")
                return create_event(body)
            except json.JSONDecodeError as e:
                logger.error(f"JSON decode error: {e}")
                return create_response(400, {
                    'error': 'Invalid JSON',
                    'message': 'Request body must be valid JSON'
                })
            except Exception as e:
                logger.error(f"Error processing POST request: {e}")
                return create_response(400, {
                    'error': 'Bad Request',
                    'message': 'Error processing request body'
                })

        elif http_method == 'DELETE' and (path.endswith('/eventcalendar') or path.endswith('/events')):
            # Delete event by ID (from query parameter or request body)
            try:
                event_id = None

                # First try to get event ID from query parameters
                if 'id' in query_params and query_params['id']:
                    event_id = query_params['id']
                else:
                    # If not in query params, try request body
                    request_body = event.get('body', '{}')
                    if request_body:
                        # Handle base64 encoded body from API Gateway
                        if event.get('isBase64Encoded', False):
                            import base64
                            request_body = base64.b64decode(request_body).decode('utf-8')

                        try:
                            body = json.loads(request_body)
                            event_id = body.get('id')
                        except json.JSONDecodeError:
                            pass

                if not event_id:
                    return create_response(400, {
                        'error': 'Bad Request',
                        'message': 'Event ID is required for deletion. Provide it as query parameter ?id=eventId or in request body {"id": "eventId"}'
                    })

                logger.info(f"Deleting event with ID: {event_id}")
                return delete_event(event_id)

            except Exception as e:
                logger.error(f"Error processing DELETE request: {e}")
                return create_response(400, {
                    'error': 'Bad Request',
                    'message': 'Error processing delete request'
                })

        elif http_method == 'GET' and (path.endswith('/eventcalendar') or path.endswith('/events')):
            # Get all events or specific event by ID
            if 'id' in query_params and query_params['id']:
                # Get specific event by ID
                return get_event_by_id(query_params['id'])
            else:
                # Get all events
                return get_events(query_params)

        else:
            return create_response(404, {
                'error': 'Not found',
                'message': f'{http_method} {path} is not supported'
            })

    except Exception as e:
        logger.error(f"Handler error: {e}")
        logger.error(f"Event data: {json.dumps(event, default=str)}")
        return create_response(500, {
            'error': 'Internal server error',
            'message': 'An unexpected error occurred'
        })