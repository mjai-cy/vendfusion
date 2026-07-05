import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
import os

load_dotenv()

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.sendgrid.net")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")
EMAIL_FROM = os.getenv("EMAIL_FROM", "noreply@vendfusion.ai")


def send_email(
    to_email: str,
    subject: str,
    body: str,
    from_email: str = None,
    is_html: bool = False
) -> dict:
    """Send email via SendGrid SMTP"""

    sender = from_email or EMAIL_FROM

    try:
        msg = MIMEMultipart()
        msg['From'] = sender
        msg['To'] = to_email
        msg['Subject'] = subject

        if is_html:
            msg.attach(MIMEText(body, 'html'))
        else:
            msg.attach(MIMEText(body, 'plain'))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.send_message(msg)

        return {
            "success": True,
            "message": f"Email sent to {to_email}",
            "from": sender,
            "to": to_email,
            "subject": subject
        }

    except Exception as e:
        return {
            "success": False,
            "message": str(e),
            "from": sender,
            "to": to_email,
            "subject": subject
        }


def send_bulk_emails(
    recipients: list,
    subject: str,
    body: str,
    from_email: str = None
) -> dict:
    """Send emails to multiple recipients"""

    results = []
    for recipient in recipients:
        result = send_email(
            to_email=recipient.get("email"),
            subject=subject,
            body=body,
            from_email=from_email
        )
        results.append(result)

    successful = sum(1 for r in results if r["success"])
    failed = sum(1 for r in results if not r["success"])

    return {
        "total": len(recipients),
        "successful": successful,
        "failed": failed,
        "results": results
    }


def send_warmup_email(to_email: str, from_email: str) -> dict:
    """Send a warmup email to build sender reputation"""

    subject = "Quick check-in"
    body = f"""Hi,

Just wanted to reach out and see how things are going.

Best regards,
"""

    return send_email(to_email, subject, body, from_email)
