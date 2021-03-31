resource "aws_lambda_function" "bridgeapi" {
  filename      = var.lambda_zip_filename
  function_name = var.lambda_function_name
  handler       = var.lambda_function_handler
  role          = var.lambda_role_arn
  runtime       = "nodejs12.x"
  layers        = var.bridgeapi_lambda_layer == "" ? [] : [var.bridgeapi_lambda_layer]
  memory_size   = 128
  timeout       = 30
  environment {
    variables = {
      region = var.lambda_region
      tableName = var.dynamodb_tablename
    }
  }
}

resource "aws_lambda_function_event_invoke_config" "bridgeapi-event-invoke-config" {
  function_name = aws_lambda_function.bridgeapi.arn
  maximum_event_age_in_seconds = 60
  maximum_retry_attempts       = 0
}

resource "aws_lambda_permission" "bridgeapi" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.bridgeapi.arn
  principal     = "apigateway.amazonaws.com"
}

output "aws-lambda-function-bridgeapi-arn" {
  value = aws_lambda_function.bridgeapi.arn
}

output "aws-lambda-function-bridgeapi-invoke-arn" {
  value = aws_lambda_function.bridgeapi.invoke_arn
}
