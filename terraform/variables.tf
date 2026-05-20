variable "website_files" {
  type = map(string)
  default = {
    "index.html"  = "text/html"
    "app.js"      = "application/javascript"
    "styles.css"  = "text/css"
  }
}