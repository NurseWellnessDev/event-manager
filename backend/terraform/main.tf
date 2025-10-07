# DynamoDB Table for Events
resource "aws_dynamodb_table" "events_table" {
  name           = "events-table"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "id"

  attribute {
    name = "id"
    type = "S"
  }

  # Optional: Add a Global Secondary Index for querying by date
  global_secondary_index {
    name     = "date-index"
    hash_key = "date"
    projection_type = "ALL"
  }

  attribute {
    name = "date"
    type = "S"
  }

  tags = {
    Name        = "Events Table"
    Environment = "dev"
  }
}

# IAM Role for Lambda
resource "aws_iam_role" "lambda_role" {
  name = "events-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# IAM Policy for DynamoDB access
resource "aws_iam_policy" "lambda_dynamodb_policy" {
  name        = "events-lambda-dynamodb-policy"
  description = "IAM policy for Lambda to access DynamoDB"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Scan",
          "dynamodb:Query"
        ]
        Resource = [
          aws_dynamodb_table.events_table.arn,
          "${aws_dynamodb_table.events_table.arn}/index/*"
        ]
      }
    ]
  })
}

# Attach DynamoDB policy to Lambda role
resource "aws_iam_role_policy_attachment" "lambda_dynamodb_policy_attachment" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.lambda_dynamodb_policy.arn
}

# Attach basic Lambda execution policy
resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Lambda Function
resource "aws_lambda_function" "events_lambda" {
  filename         = "lambda_function.zip"
  function_name    = "events-api"
  role            = aws_iam_role.lambda_role.arn
  handler         = "lambda_function.lambda_handler"
  runtime         = "python3.11"
  timeout         = 30

  environment {
    variables = {
      DYNAMODB_TABLE_NAME = aws_dynamodb_table.events_table.name
    }
  }

  depends_on = [
    aws_iam_role_policy_attachment.lambda_dynamodb_policy_attachment,
    aws_iam_role_policy_attachment.lambda_basic_execution,
  ]
}

# API Gateway REST API
resource "aws_api_gateway_rest_api" "events_api" {
  name        = "events-api"
  description = "API for managing events"

  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

# API Gateway Resource for /events
resource "aws_api_gateway_resource" "events_resource" {
  rest_api_id = aws_api_gateway_rest_api.events_api.id
  parent_id   = aws_api_gateway_rest_api.events_api.root_resource_id
  path_part   = "events"
}

# API Gateway Resource for /events/{id}
resource "aws_api_gateway_resource" "event_by_id_resource" {
  rest_api_id = aws_api_gateway_rest_api.events_api.id
  parent_id   = aws_api_gateway_resource.events_resource.id
  path_part   = "{id}"
}

# API Gateway Method for GET /events
resource "aws_api_gateway_method" "get_events" {
  rest_api_id   = aws_api_gateway_rest_api.events_api.id
  resource_id   = aws_api_gateway_resource.events_resource.id
  http_method   = "GET"
  authorization = "NONE"
}

# API Gateway Method for POST /events
resource "aws_api_gateway_method" "post_events" {
  rest_api_id   = aws_api_gateway_rest_api.events_api.id
  resource_id   = aws_api_gateway_resource.events_resource.id
  http_method   = "POST"
  authorization = "NONE"
}

# API Gateway Method for GET /events/{id}
resource "aws_api_gateway_method" "get_event_by_id" {
  rest_api_id   = aws_api_gateway_rest_api.events_api.id
  resource_id   = aws_api_gateway_resource.event_by_id_resource.id
  http_method   = "GET"
  authorization = "NONE"
}

# API Gateway Integration for GET /events
resource "aws_api_gateway_integration" "get_events_integration" {
  rest_api_id = aws_api_gateway_rest_api.events_api.id
  resource_id = aws_api_gateway_resource.events_resource.id
  http_method = aws_api_gateway_method.get_events.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.events_lambda.invoke_arn
}

# API Gateway Integration for POST /events
resource "aws_api_gateway_integration" "post_events_integration" {
  rest_api_id = aws_api_gateway_rest_api.events_api.id
  resource_id = aws_api_gateway_resource.events_resource.id
  http_method = aws_api_gateway_method.post_events.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.events_lambda.invoke_arn
}

# API Gateway Integration for GET /events/{id}
resource "aws_api_gateway_integration" "get_event_by_id_integration" {
  rest_api_id = aws_api_gateway_rest_api.events_api.id
  resource_id = aws_api_gateway_resource.event_by_id_resource.id
  http_method = aws_api_gateway_method.get_event_by_id.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.events_lambda.invoke_arn
}

# Lambda permission for API Gateway
resource "aws_lambda_permission" "api_gateway_lambda" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.events_lambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.events_api.execution_arn}/*/*"
}

# API Gateway Deployment
resource "aws_api_gateway_deployment" "events_api_deployment" {
  depends_on = [
    aws_api_gateway_integration.get_events_integration,
    aws_api_gateway_integration.post_events_integration,
    aws_api_gateway_integration.get_event_by_id_integration,
  ]

  rest_api_id = aws_api_gateway_rest_api.events_api.id
  stage_name  = "prod"
}

# Outputs
output "api_gateway_url" {
  description = "URL of the API Gateway"
  value       = "${aws_api_gateway_deployment.events_api_deployment.invoke_url}/events"
}

output "dynamodb_table_name" {
  description = "Name of the DynamoDB table"
  value       = aws_dynamodb_table.events_table.name
}

output "lambda_function_name" {
  description = "Name of the Lambda function"
  value       = aws_lambda_function.events_lambda.function_name
}