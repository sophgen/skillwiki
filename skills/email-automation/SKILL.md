---
name: email-automation
description: Automate email workflows, send bulk messages, process templates, and schedule emails. Integrate with Gmail, Outlook, SMTP, and more.
metadata:
  author: Carol Johnson
  difficulty: intermediate
  rating: 4.5
  domain: workflow
  useCases:
    - Email automation
    - Bulk messaging campaigns
    - Workflow scheduling
    - Template processing
    - Newsletter distribution
  featured: false
  tags:
    - email
    - automation
    - workflow
    - messaging
---

# Email Automation Skill

Automate your email workflows with templates, scheduling, and multi-provider support.

## Features

- Send emails programmatically (Gmail, Outlook, SMTP)
- Template processing with variable substitution
- Batch email operations
- Email scheduling
- Attachment handling
- HTML and plain text support

## Quick Start

### Using Gmail

```python
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

class EmailAutomation:
    def __init__(self, sender_email, password):
        self.sender_email = sender_email
        self.password = password
        self.smtp_server = "smtp.gmail.com"
        self.smtp_port = 587

    def send_email(self, recipient, subject, body, is_html=False):
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = self.sender_email
        message["To"] = recipient

        # Attach body
        mime_type = "html" if is_html else "plain"
        message.attach(MIMEText(body, mime_type))

        # Send email
        with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
            server.starttls()
            server.login(self.sender_email, self.password)
            server.sendmail(self.sender_email, recipient, message.as_string())
```

## Email Templates

```python
def process_template(template, variables):
    """Replace variables in template"""
    content = template
    for key, value in variables.items():
        content = content.replace(f"{{{{{key}}}}}", value)
    return content

# Template example
welcome_template = """
Hello {{name}},

Welcome to {{company}}! We're excited to have you on board.

Best regards,
The {{company}} Team
"""

# Send templated email
variables = {
    "name": "Alice",
    "company": "TechCorp"
}

body = process_template(welcome_template, variables)
emailer.send_email("alice@example.com", "Welcome!", body, is_html=False)
```

## Bulk Email Operations

```python
def send_bulk_emails(recipients_data, subject, template):
    """Send emails to multiple recipients"""
    results = {
        "sent": [],
        "failed": []
    }

    for recipient in recipients_data:
        try:
            body = process_template(template, recipient)
            send_email(recipient["email"], subject, body)
            results["sent"].append(recipient["email"])
        except Exception as e:
            results["failed"].append({
                "email": recipient["email"],
                "error": str(e)
            })

    return results
```

## Email Scheduling

```python
import schedule
import time

def schedule_emails(recipients_data, subject, template, send_time):
    """Schedule emails to be sent at specific time"""
    def send_scheduled():
        send_bulk_emails(recipients_data, subject, template)

    schedule.at(send_time).do(send_scheduled)

    # Keep scheduler running
    while True:
        schedule.run_pending()
        time.sleep(60)
```

## Best Practices

1. Always verify email addresses before sending
2. Include unsubscribe options in bulk emails
3. Use HTML templates for better formatting
4. Set appropriate rate limits to avoid throttling
5. Log all email operations for auditing
6. Use environment variables for credentials (never hardcode)
7. Test templates with sample data first

## Providers Supported

- Gmail (requires app password)
- Outlook/Office 365
- Generic SMTP servers
- SendGrid API
- Mailgun API

## Examples

### Newsletter Distribution
Send monthly newsletters to subscribers with personalization

### Notification System
Automated alerts and notifications to users

### Customer Onboarding
Welcome emails and setup instructions for new users

### Report Distribution
Automated report generation and email delivery

## Security Notes

- Never store credentials in code
- Use OAuth2 when available
- Validate recipient addresses
- Implement rate limiting
- Monitor for unauthorized access
