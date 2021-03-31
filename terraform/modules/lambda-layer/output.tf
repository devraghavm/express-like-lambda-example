output "bridgeapi_lambda_layer_arn_with_version" {
  value = aws_lambda_layer_version.bridgeapi_lambda_layer.arn
}

output "bridgeapi_lambda_layer_version" {
  value = aws_lambda_layer_version.bridgeapi_lambda_layer.version
}
