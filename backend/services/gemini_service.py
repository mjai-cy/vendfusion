import google.generativeai as genai
from dotenv import load_dotenv
import os
import json

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


def generate_personalized_email(
    lead_first_name: str,
    lead_last_name: str,
    lead_company: str,
    lead_job_title: str,
    lead_industry: str = None,
    sender_name: str = "Sales Team",
    sender_company: str = "VendFusion",
    tone: str = "professional",
    additional_context: str = None,
) -> dict:
    """Generate personalized email using Google Gemini AI"""

    if not GEMINI_API_KEY or GEMINI_API_KEY == "demo-key":
        return _generate_template(
            lead_first_name, lead_last_name, lead_company,
            lead_job_title, lead_industry, sender_name,
            sender_company, tone, additional_context
        )

    try:
        industry_context = f" They work in the {lead_industry} industry." if lead_industry else ""
        extra_context = f"\n\nAdditional context: {additional_context}" if additional_context else ""

        prompt = f"""Write a cold outreach email with these specifications:

Recipient: {lead_first_name} {lead_last_name}
Company: {lead_company}
Job Title: {lead_job_title}{industry_context}

Sender: {sender_name} from {sender_company}
Tone: {tone}{extra_context}

Requirements:
1. Subject line should be compelling and personalized
2. Opening should reference something specific about their role or company
3. Body should highlight value proposition relevant to their position
4. Include a clear call-to-action
5. Keep it under 150 words
6. Make it feel human and not salesy

Return in this exact format:
SUBJECT: [subject line]
BODY: [email body]
NOTES: [personalization notes]"""

        model = genai.GenerativeModel('gemini-2.0-flash')
        response = model.generate_content(prompt)
        content = response.text

        subject = ""
        body = ""
        notes = ""

        for line in content.split("\n"):
            if line.startswith("SUBJECT:"):
                subject = line.replace("SUBJECT:", "").strip()
            elif line.startswith("BODY:"):
                body = line.replace("BODY:", "").strip()
            elif line.startswith("NOTES:"):
                notes = line.replace("NOTES:", "").strip()

        return {
            "subject": subject or f"Quick question about {lead_company}",
            "body": body,
            "personalization_notes": notes
        }

    except Exception as e:
        return _generate_template(
            lead_first_name, lead_last_name, lead_company,
            lead_job_title, lead_industry, sender_name,
            sender_company, tone, additional_context
        )


def generate_company_analysis(url_or_name: str) -> dict:
    """Analyze a company by scraping its website for real data"""

    from services.scanner_service import scrape_company_website
    scraped = scrape_company_website(url_or_name)

    if GEMINI_API_KEY and GEMINI_API_KEY != "demo-key":
        try:
            context = f"Company: {scraped['company_name']}\nWebsite: {scraped['website']}\nDescription: {scraped['description']}\nTech stack: {', '.join(scraped['tech_stack'])}\nTeam page: {scraped['team_url']}"
            prompt = f"""Based on this real company data, provide a brief sales analysis:

{context}

Return JSON:
{{
    "suggested_approach": "1-2 sentence outbound sales pitch suggestion based on their actual tech stack and business",
    "pain_points": ["pain point 1", "pain point 2", "pain point 3"]
}}

Only return valid JSON, nothing else."""

            model = genai.GenerativeModel('gemini-2.0-flash')
            response = model.generate_content(prompt)
            content = response.text.strip()
            if content.startswith("```"):
                content = content.split("```")[1]
                if content.startswith("json"):
                    content = content[4:]
            ai_data = json.loads(content)
            scraped["suggested_approach"] = ai_data.get("suggested_approach", scraped["suggested_approach"])
            scraped["pain_points"] = ai_data.get("pain_points", scraped["pain_points"])
        except Exception:
            pass

    return {
        "company_name": scraped["company_name"],
        "industry": scraped.get("industry", "Technology"),
        "description": scraped["description"],
        "company_size": scraped.get("company_size", "Unknown"),
        "location": scraped.get("location", "Unknown"),
        "website": scraped.get("website", ""),
        "tech_stack": scraped.get("tech_stack", []),
        "pain_points": scraped.get("pain_points", []),
        "suggested_approach": scraped.get("suggested_approach", ""),
        "founder_name": scraped.get("founder_name", ""),
        "founder_email": scraped.get("founder_email", ""),
        "linkedin": scraped.get("linkedin", ""),
        "team_url": scraped.get("team_url", ""),
        "emails_found": scraped.get("emails_found", []),
    }


def find_people_at_company(company_name: str, roles: str = None) -> dict:
    """Find real contacts at a company using HubSpot CRM + web scraping"""

    from services.scanner_service import find_people_from_web_and_crm
    result = find_people_from_web_and_crm(company_name, roles)
    return result


def _generate_template(
    lead_first_name, lead_last_name, lead_company,
    lead_job_title, lead_industry, sender_name,
    sender_company, tone, additional_context
):
    templates = {
        "professional": {
            "subjects": [
                f"Quick question about {lead_company}'s growth",
                f"{lead_first_name},想法 about your team at {lead_company}",
                f"Idea for {lead_company}",
            ],
            "bodies": [
                f"""Hi {lead_first_name},

I noticed you're leading the {lead_job_title} team at {lead_company}. With your focus on growth, I thought you'd find this interesting.

We've helped companies like yours streamline their outreach and book 3x more meetings. Our AI agents handle the entire process - from finding leads to booking meetings.

Would you be open to a quick 15-minute call to see how this could work for {lead_company}?

Best,
{sender_name}
{sender_company}""",
            ]
        },
        "casual": {
            "subjects": [
                f"{lead_first_name}, quick thought",
                f"Love what {lead_company} is doing",
            ],
            "bodies": [
                f"""Hey {lead_first_name}!

Saw you're the {lead_job_title} at {lead_company} - that's awesome.

I've been helping teams like yours automate their outreach and the results have been insane. We're talking 3x more meetings with half the effort.

Worth a quick chat? I promise it'll be worth your time.

Cheers,
{sender_name}""",
            ]
        },
        "formal": {
            "subjects": [
                f"Partnership Opportunity - {lead_company}",
                f"Strategic Initiative for {lead_company}",
            ],
            "bodies": [
                f"""Dear {lead_first_name},

I hope this message finds you well. As {lead_job_title} at {lead_company}, you understand the importance of efficient outreach strategies.

Our platform has demonstrated measurable results for organizations in your sector, including a 300% increase in qualified meetings.

I would welcome the opportunity to discuss how we might support {lead_company}'s growth objectives.

Sincerely,
{sender_name}
{sender_company}""",
            ]
        }
    }

    tone_templates = templates.get(tone, templates["professional"])
    subject = tone_templates["subjects"][0]
    body = tone_templates["bodies"][0]

    return {
        "subject": subject,
        "body": body,
        "personalization_notes": f"Template-based generation for {lead_company} ({lead_job_title})"
    }
