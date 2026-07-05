from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from database import get_db, Lead, Campaign, User
from models import AIEmailRequest, AIEmailResponse
from auth import get_current_user
from services.gemini_service import generate_personalized_email

router = APIRouter(prefix="/api/ai", tags=["ai"])


class CompanyAnalysisRequest(BaseModel):
    url_or_name: str

class CompanyAnalysisResponse(BaseModel):
    company_name: str
    industry: str = ""
    description: str = ""
    company_size: str = ""
    location: str = ""
    website: str = ""
    tech_stack: list[str] = []
    pain_points: list[str] = []
    suggested_approach: str = ""
    founder_name: str = ""
    founder_email: str = ""
    linkedin: str = ""
    team_url: str = ""
    emails_found: list[str] = []


class PeopleFinderRequest(BaseModel):
    company: str
    roles: Optional[str] = None

class PeopleFinderContact(BaseModel):
    name: str = ""
    title: str = ""
    email: str = ""
    phone: str = ""
    linkedin: str = ""
    source: str = ""
    relevance: str = ""

class PeopleFinderResponse(BaseModel):
    company: str
    contacts: list[PeopleFinderContact] = []
    note: str = ""


@router.post("/analyze-company", response_model=CompanyAnalysisResponse)
def analyze_company(
    request: CompanyAnalysisRequest,
    current_user: User = Depends(get_current_user),
):
    from services.gemini_service import generate_company_analysis
    result = generate_company_analysis(request.url_or_name)
    return CompanyAnalysisResponse(**result)


@router.post("/find-people", response_model=PeopleFinderResponse)
def find_people(
    request: PeopleFinderRequest,
    current_user: User = Depends(get_current_user),
):
    from services.gemini_service import find_people_at_company
    result = find_people_at_company(request.company, request.roles)
    contacts = []
    for c in result.get("contacts", []):
        contacts.append(PeopleFinderContact(
            name=str(c.get("name", "") or ""),
            title=str(c.get("title", "") or ""),
            email=str(c.get("email", "") or ""),
            phone=str(c.get("phone", "") or ""),
            linkedin=str(c.get("linkedin", "") or ""),
            source=str(c.get("source", "") or ""),
            relevance=str(c.get("relevance", "") or ""),
        ))
    return PeopleFinderResponse(
        company=result.get("company", request.company),
        contacts=contacts,
        note=result.get("note", "")
    )


@router.post("/generate-email", response_model=AIEmailResponse)
def generate_email(
    request: AIEmailRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    lead = db.query(Lead).filter(
        Lead.id == request.lead_id,
        Lead.owner_id == current_user.id
    ).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    campaign = db.query(Campaign).filter(
        Campaign.id == request.campaign_id,
        Campaign.owner_id == current_user.id
    ).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    result = generate_personalized_email(
        lead_first_name=lead.first_name or "there",
        lead_last_name=lead.last_name or "",
        lead_company=lead.company or "your company",
        lead_job_title=lead.job_title or "professional",
        lead_industry=lead.industry,
        sender_name=current_user.full_name or "Sales Team",
        sender_company=current_user.company_name or "VendFusion",
        tone=request.tone,
        additional_context=request.additional_context,
    )

    return AIEmailResponse(**result)


@router.post("/generate-bulk")
def generate_bulk_emails(
    lead_ids: list[int],
    campaign_id: int,
    tone: str = "professional",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    campaign = db.query(Campaign).filter(
        Campaign.id == campaign_id,
        Campaign.owner_id == current_user.id
    ).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    leads = db.query(Lead).filter(
        Lead.id.in_(lead_ids),
        Lead.owner_id == current_user.id
    ).all()

    generated_emails = []
    for lead in leads:
        result = generate_personalized_email(
            lead_first_name=lead.first_name or "there",
            lead_last_name=lead.last_name or "",
            lead_company=lead.company or "your company",
            lead_job_title=lead.job_title or "professional",
            lead_industry=lead.industry,
            sender_name=current_user.full_name or "Sales Team",
            sender_company=current_user.company_name or "VendFusion",
            tone=tone,
        )
        generated_emails.append({
            "lead_id": lead.id,
            "lead_email": lead.email,
            **result
        })

    return {
        "campaign_id": campaign_id,
        "emails_generated": len(generated_emails),
        "emails": generated_emails
    }


@router.post("/improve-email")
def improve_email(
    original_subject: str,
    original_body: str,
    improvement_instructions: str,
    current_user: User = Depends(get_current_user),
):
    result = generate_personalized_email(
        lead_first_name="",
        lead_last_name="",
        lead_company="",
        lead_job_title="",
        sender_name=current_user.full_name or "Sales Team",
        sender_company=current_user.company_name or "VendFusion",
        additional_context=f"Improve this email: {improvement_instructions}\n\nOriginal subject: {original_subject}\nOriginal body: {original_body}",
    )

    return result
