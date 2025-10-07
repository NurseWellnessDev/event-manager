"""
Test script for the Lambda function
Run this locally to test the Lambda function logic
"""

import json
from lambda_function import lambda_handler

def test_create_event():
    """Test creating a new event"""
    event = {
        'httpMethod': 'POST',
        'path': '/events',
        'body': json.dumps({
            'title': 'Test Event',
            'description': 'This is a test event created from the Lambda function',
            'date': '2025-12-25',
            'time': '2:00 PM - 4:00 PM',
            'location': 'Test Location, PA',
            'link': 'https://example.com/test-event'
        })
    }

    context = {}

    print("Testing event creation...")
    response = lambda_handler(event, context)
    print(f"Response: {json.dumps(response, indent=2)}")
    print()

def test_get_events():
    """Test retrieving all events"""
    event = {
        'httpMethod': 'GET',
        'path': '/events'
    }

    context = {}

    print("Testing get all events...")
    response = lambda_handler(event, context)
    print(f"Response: {json.dumps(response, indent=2)}")
    print()

def test_invalid_event():
    """Test creating an event with invalid data"""
    event = {
        'httpMethod': 'POST',
        'path': '/events',
        'body': json.dumps({
            'title': '',  # Empty title should fail validation
            'description': 'This should fail',
            'date': 'invalid-date',  # Invalid date format
            'time': '2:00 PM',
            'location': 'Test Location'
        })
    }

    context = {}

    print("Testing invalid event creation...")
    response = lambda_handler(event, context)
    print(f"Response: {json.dumps(response, indent=2)}")
    print()

def test_cors_preflight():
    """Test CORS preflight request"""
    event = {
        'httpMethod': 'OPTIONS',
        'path': '/events'
    }

    context = {}

    print("Testing CORS preflight...")
    response = lambda_handler(event, context)
    print(f"Response: {json.dumps(response, indent=2)}")
    print()

if __name__ == "__main__":
    print("=== Lambda Function Local Tests ===")
    print("Note: These tests will fail if DynamoDB is not configured")
    print("They are provided to demonstrate the function structure")
    print()

    test_cors_preflight()
    test_invalid_event()

    # Uncomment these if you have DynamoDB configured locally
    # test_create_event()
    # test_get_events()

    print("=== Tests completed ===")