locals {
  layer_name    = "bridgeApiLayer"
  layer_payload = "/tmp/bridgeApiLayer.zip"

  lambda_name   = "bridgeapi"
  zip_file_name = "/tmp/bridgeApi.zip"
  handler_name  = "index.handler"
  lambda_region = "us-west-2"
  dynamodb_tablename = "bridge-customer"
}

module "archive" {
  source = "./modules/archive"
}


module "bridgeapi_lambda_layer" {
  source               = "./modules/lambda-layer"
  lambda_layer_name    = local.layer_name
  lambda_layer_payload = local.layer_payload
}

module "lambda" {
  source = "./modules/lambda"
  lambda_function_name    = local.lambda_name
  lambda_function_handler = local.handler_name
  lambda_role_arn         = data.aws_iam_role.bridgeapi.arn
  lambda_zip_filename     = local.zip_file_name
  bridgeapi_lambda_layer = module.bridgeapi_lambda_layer.bridgeapi_lambda_layer_arn_with_version
  lambda_region = local.lambda_region
  dynamodb_tablename = local.dynamodb_tablename
}

module "api-gateway" {
  source = "./modules/api-gateway"
  aws-lambda-function-bridgeapi-arn = module.lambda.aws-lambda-function-bridgeapi-arn
  aws-lambda-function-bridgeapi-invoke-arn = module.lambda.aws-lambda-function-bridgeapi-invoke-arn
}

# Set the generated URL as an output. Run `terraform output url` to get this.
output "endpoint" {
  value = module.api-gateway.endpoint
}

output "aws-iam-role-bridgeapi-arn" {
  value = data.aws_iam_role.bridgeapi.arn
}
