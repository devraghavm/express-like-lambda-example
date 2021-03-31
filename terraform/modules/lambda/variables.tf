variable "lambda_function_name" {}
variable "lambda_role_arn" {}
variable "lambda_zip_filename" {}
variable "lambda_function_handler" {}
variable "bridgeapi_lambda_layer" {
  default = ""
}
variable "lambda_region" {}
variable "dynamodb_tablename" {}
