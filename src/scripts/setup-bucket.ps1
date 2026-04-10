$headers = @{
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3Zm5vZXJuZHV2dWhwdXB2dXRqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTM3MDcyOCwiZXhwIjoyMDgwOTQ2NzI4fQ.dXjkSxhZtepyNhPl4_nMJDZ99xZCyn0TvvzuQSnJ8OQ"
    "Content-Type" = "application/json"
}

$body = @{
    name = "ticket-attachments"
    public = $true
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://bwfnoernduvuhpupvutj.supabase.co/storage/v1/bucket" -Method Post -Headers $headers -Body $body
