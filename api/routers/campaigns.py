from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db, Campaign, EmailLog, Lead, User
from models import CampaignCreate, CampaignUpdate, CampaignResponse
from auth import get_current_user
from datetime import datetime

router = APIRouter(prefix="/api/campaigns", tags=["campaigns"])


@router.get("/", response_model=List[CampaignResponse])
def get_campaigns(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    campaigns = db.query(Campaign).filter(
        Campaign.owner_id == current_user.id
    ).offset(skip).limit(limit).all()
    return campaigns


@router.get("/{campaign_id}", response_model=CampaignResponse)
def get_campaign(
    campaign_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    campaign = db.query(Campaign).filter(
        Campaign.id == campaign_id,
        Campaign.owner_id == current_user.id
    ).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign


@router.post("/", response_model=CampaignResponse)
def create_campaign(
    campaign_data: CampaignCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    campaign = Campaign(
        owner_id=current_user.id,
        **campaign_data.model_dump()
    )
    db.add(campaign)
    db.commit()
    db.refresh(campaign)
    return campaign


@router.put("/{campaign_id}", response_model=CampaignResponse)
def update_campaign(
    campaign_id: int,
    campaign_data: CampaignUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    campaign = db.query(Campaign).filter(
        Campaign.id == campaign_id,
        Campaign.owner_id == current_user.id
    ).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    update_data = campaign_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(campaign, key, value)

    db.commit()
    db.refresh(campaign)
    return campaign


@router.delete("/{campaign_id}")
def delete_campaign(
    campaign_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    campaign = db.query(Campaign).filter(
        Campaign.id == campaign_id,
        Campaign.owner_id == current_user.id
    ).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    db.delete(campaign)
    db.commit()
    return {"message": "Campaign deleted successfully"}


@router.post("/{campaign_id}/add-leads")
def add_leads_to_campaign(
    campaign_id: int,
    lead_ids: List[int],
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

    campaign.total_leads = len(leads)
    db.commit()

    return {"message": f"Added {len(leads)} leads to campaign"}


@router.post("/{campaign_id}/send")
def send_campaign_emails(
    campaign_id: int,
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
        Lead.owner_id == current_user.id,
        Lead.is_qualified == True
    ).limit(50).all()

    if not leads:
        raise HTTPException(status_code=400, detail="No qualified leads found. Add and qualify leads first.")

    from services.email_service import send_email
    from services.gemini_service import generate_personalized_email

    sent_count = 0
    failed_count = 0
    email_logs = []

    for lead in leads:
        email_content = generate_personalized_email(
            lead_first_name=lead.first_name or "there",
            lead_last_name=lead.last_name or "",
            lead_company=lead.company or "your company",
            lead_job_title=lead.job_title or "professional",
            lead_industry=lead.industry,
            sender_name=current_user.full_name or "Sales Team",
            sender_company=current_user.company_name or "VendFusion",
            tone="professional",
        )

        result = send_email(
            to_email=lead.email,
            subject=email_content["subject"],
            body=email_content["body"],
        )

        log = EmailLog(
            campaign_id=campaign.id,
            lead_id=lead.id,
            sender_email=current_user.email,
            recipient_email=lead.email,
            subject=email_content["subject"],
            body=email_content["body"],
            status="sent" if result["success"] else "failed",
            ai_personalized=True,
            sent_at=datetime.utcnow() if result["success"] else None,
        )
        db.add(log)
        email_logs.append(log)

        if result["success"]:
            sent_count += 1
        else:
            failed_count += 1

    campaign.status = "active"
    campaign.emails_sent += sent_count
    campaign.total_leads = len(leads)
    db.commit()

    return {
        "message": f"Campaign emails sent: {sent_count} successful, {failed_count} failed",
        "emails_sent": sent_count,
        "emails_failed": failed_count,
        "total_leads": len(leads),
        "campaign_status": campaign.status
    }


@router.get("/{campaign_id}/stats")
def get_campaign_stats(
    campaign_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    campaign = db.query(Campaign).filter(
        Campaign.id == campaign_id,
        Campaign.owner_id == current_user.id
    ).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    open_rate = (campaign.emails_opened / campaign.emails_sent * 100) if campaign.emails_sent > 0 else 0
    reply_rate = (campaign.emails_replied / campaign.emails_sent * 100) if campaign.emails_sent > 0 else 0

    return {
        "campaign_id": campaign.id,
        "total_leads": campaign.total_leads,
        "emails_sent": campaign.emails_sent,
        "emails_opened": campaign.emails_opened,
        "emails_replied": campaign.emails_replied,
        "meetings_booked": campaign.meetings_booked,
        "open_rate": round(open_rate, 2),
        "reply_rate": round(reply_rate, 2)
    }
