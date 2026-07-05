import google.generativeai as genai
from dotenv import load_dotenv
import os

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
    """Analyze a company using Gemini AI based on URL or name"""

    if not GEMINI_API_KEY or GEMINI_API_KEY == "demo-key":
        return {
            "company_name": url_or_name.split("/")[-1].replace(".com", "").replace(".in", "").replace(".io", "").title(),
            "industry": "Technology",
            "description": f"{url_or_name} is a company that could benefit from AI-powered outbound sales automation.",
            "company_size": "10-50",
            "location": "Global",
            "pain_points": ["Manual outreach is time-consuming", "Low email reply rates", "Difficulty scaling sales"],
            "suggested_approach": "Lead with AI automation benefits and time savings. Focus on how VendFusion can help them scale outreach."
        }

    try:
        prompt = f"""Analyze the company: {url_or_name}

Provide a JSON response with these fields (no markdown, just plain JSON):
{{
    "company_name": "Company Name",
    "industry": "Industry sector",
    "description": "2-3 sentence description of what this company does and who they serve",
    "company_size": "Estimated company size (e.g. 1-10, 10-50, 50-200, 200+)",
    "location": "Primary location",
    "pain_points": ["pain point 1", "pain point 2", "pain point 3"],
    "suggested_approach": "1-2 sentence suggestion for approaching this company with an outbound sales pitch"
}}

Only return the JSON, nothing else."""

        model = genai.GenerativeModel('gemini-2.0-flash')
        response = model.generate_content(prompt)
        content = response.text.strip()

        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]

        import json
        result = json.loads(content)
        return result

    except Exception as e:
        return {
            "company_name": url_or_name.split("/")[-1].replace(".com", "").replace(".in", "").replace(".io", "").title(),
            "industry": "Technology",
            "description": f"Analysis for {url_or_name}. The company appears to be in the technology sector.",
            "company_size": "Unknown",
            "location": "Unknown",
            "pain_points": ["Could benefit from automated outreach", "May struggle with lead generation", "Scaling sales processes"],
            "suggested_approach": f"Research {url_or_name} further before reaching out. Focus on their specific pain points."
        }


def find_people_at_company(company_name: str, roles: str = None) -> dict:
    """Find key contacts at a company using Gemini AI"""

    if not GEMINI_API_KEY or GEMINI_API_KEY == "demo-key":
        return {
            "company": company_name,
            "contacts": [
                {
                    "name": "Sample Contact",
                    "title": "Head of Sales",
                    "email": f"sales@{company_name.lower().replace(' ', '')}.com",
                    "linkedin": f"https://linkedin.com/in/sample",
                    "relevance": "High - decision maker for sales tools",
                }
            ],
            "note": "Add your Gemini API key for AI-powered people discovery"
        }

    try:
        role_filter = f" Focus on these roles: {roles}" if roles else ""

        prompt = f"""Find key decision makers and contacts at the company: {company_name}.{role_filter}

Return a JSON response with:
{{
    "company": "{company_name}",
    "contacts": [
        {{
            "name": "Full Name",
            "title": "Job Title",
            "email": "likely email format",
            "linkedin": "linkedin profile url if known",
            "relevance": "Why this person is a good contact"
        }}
    ],
    "note": "Brief note about the company's decision-making structure"
}}

Return 3-5 key contacts. Only return valid JSON, nothing else."""

        model = genai.GenerativeModel('gemini-2.0-flash')
        response = model.generate_content(prompt)
        content = response.text.strip()

        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]

        import json
        result = json.loads(content)
        return result

    except Exception as e:
        return {
            "company": company_name,
            "contacts": [],
            "note": f"Gemini API quota exceeded. Try again later or add more API quota."
        }


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
