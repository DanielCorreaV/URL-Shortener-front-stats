output "cloudfront_domain_url" {
  value       = "https://${aws_cloudfront_distribution.cdn.domain_name}"
  description = "URL pública de producción provista por CloudFront para el Módulo 4"
}

output "s3_bucket_id" {
  value       = aws_s3_bucket.frontend_bucket.id
  description = "Nombre único del bucket S3 generado en el despliegue"
}