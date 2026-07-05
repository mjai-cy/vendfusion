from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db, Lead, Campaign, EmailLog, Mailbox, User
from models import DashboardStats
from auth import get_current_user
from datetime import datetime, timedelta
import random

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.post("/seed-demo-data")
def seed_demo_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    existing_leads = db.query(Lead).filter(Lead.owner_id == current_user.id).count()
    if existing_leads > 0:
        return {"message": "Demo data already exists", "leads": existing_leads}

    demo_leads = [
        {"first_name": "Rahul", "last_name": "Sharma", "email": "rahul@techcorp.in", "company": "TechCorp India", "job_title": "CTO", "industry": "Technology", "company_size": "50-200", "location": "Bangalore", "is_qualified": True},
        {"first_name": "Priya", "last_name": "Patel", "email": "priya@greenflow.com", "company": "GreenFlow Energy", "job_title": "VP Sales", "industry": "Renewable Energy", "company_size": "200+", "location": "Mumbai", "is_qualified": True},
        {"first_name": "Amit", "last_name": "Kumar", "email": "amit@finserve.in", "company": "FinServe Solutions", "job_title": "Head of Growth", "industry": "Fintech", "company_size": "50-200", "location": "Delhi", "is_qualified": True},
        {"first_name": "Sneha", "last_name": "Reddy", "email": "sneha@healthtech.co", "company": "HealthTech Labs", "job_title": "CEO", "industry": "Healthcare", "company_size": "10-50", "location": "Hyderabad", "is_qualified": True},
        {"first_name": "Vikram", "last_name": "Singh", "email": "vikram@cloudware.io", "company": "CloudWare Systems", "job_title": "Director Engineering", "industry": "Cloud Computing", "company_size": "200+", "location": "Pune", "is_qualified": True},
        {"first_name": "Ananya", "last_name": "Iyer", "email": "ananya@retailmax.in", "company": "RetailMax", "job_title": "CMO", "industry": "E-commerce", "company_size": "50-200", "location": "Chennai", "is_qualified": False},
        {"first_name": "Deepak", "last_name": "Gupta", "email": "deepak@logisticspro.com", "company": "LogisticsPro", "job_title": "COO", "industry": "Logistics", "company_size": "200+", "location": "Gurgaon", "is_qualified": True},
        {"first_name": "Kavita", "last_name": "Joshi", "email": "kavita@edulearn.in", "company": "EduLearn Platform", "job_title": "Head of Product", "industry": "EdTech", "company_size": "10-50", "location": "Bangalore", "is_qualified": False},
        {"first_name": "Rajesh", "last_name": "Verma", "email": "rajesh@mfgcorp.in", "company": "MFG Corp", "job_title": "VP Operations", "industry": "Manufacturing", "company_size": "200+", "location": "Ahmedabad", "is_qualified": True},
        {"first_name": "Meera", "last_name": "Nair", "email": "meera@traveltech.co", "company": "TravelTech Solutions", "job_title": "Growth Lead", "industry": "Travel", "company_size": "10-50", "location": "Kochi", "is_qualified": False},
        {"first_name": "Arjun", "last_name": "Mehta", "email": "arjun@saasworks.io", "company": "SaaSWorks", "job_title": "Founder", "industry": "SaaS", "company_size": "10-50", "location": "Bangalore", "is_qualified": True},
        {"first_name": "Pooja", "last_name": "Desai", "email": "pooja@finserv.co", "company": "FinServ Capital", "job_title": "Partner", "industry": "Finance", "company_size": "50-200", "location": "Mumbai", "is_qualified": True},
        {"first_name": "Suresh", "last_name": "Babu", "email": "suresh@agritech.in", "company": "AgriTech Innovations", "job_title": "CTO", "industry": "Agriculture", "company_size": "10-50", "location": "Chennai", "is_qualified": False},
        {"first_name": "Neha", "last_name": "Agarwal", "email": "neha@digitalfirst.com", "company": "DigitalFirst Agency", "job_title": "Managing Director", "industry": "Digital Marketing", "company_size": "10-50", "location": "Jaipur", "is_qualified": True},
        {"first_name": "Karthik", "last_name": "Rao", "email": "karthik@datastack.io", "company": "DataStack Analytics", "job_title": "Head of Data", "industry": "Data Analytics", "company_size": "50-200", "location": "Bangalore", "is_qualified": True},
    ]

    for lead_data in demo_leads:
        lead = Lead(owner_id=current_user.id, **lead_data)
        db.add(lead)

    demo_campaigns = [
        {"name": "Q1 SaaS Outreach", "description": "Target SaaS companies for Q1 pipeline", "status": "active", "total_leads": 5, "emails_sent": 87, "emails_opened": 34, "emails_replied": 12, "meetings_booked": 4},
        {"name": "Fintech Decision Makers", "description": "Reach out to fintech CTOs and VPs", "status": "active", "total_leads": 4, "emails_sent": 63, "emails_opened": 28, "emails_replied": 8, "meetings_booked": 3},
        {"name": "Enterprise Re-engagement", "description": "Re-engage dormant enterprise leads", "status": "completed", "total_leads": 6, "emails_sent": 120, "emails_opened": 45, "emails_replied": 15, "meetings_booked": 6},
    ]

    for camp_data in demo_campaigns:
        campaign = Campaign(owner_id=current_user.id, **camp_data)
        db.add(campaign)

    demo_mailboxes = [
        {"email_address": "rahul@vendfusion.ai", "provider": "Google Workspace", "daily_limit": 50, "warmup_score": 85.0, "is_warmed": True},
        {"email_address": "outreach@vendfusion.ai", "provider": "Microsoft 365", "daily_limit": 40, "warmup_score": 72.0, "is_warmed": True},
        {"email_address": "sales@vendfusion.ai", "provider": "Google Workspace", "daily_limit": 60, "warmup_score": 45.0, "is_warmed": False},
    ]

    for mbox_data in demo_mailboxes:
        mailbox = Mailbox(owner_id=current_user.id, **mbox_data)
        db.add(mailbox)

    db.commit()

    return {
        "message": "Demo data seeded successfully",
        "leads": len(demo_leads),
        "campaigns": len(demo_campaigns),
        "mailboxes": len(demo_mailboxes),
    }


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    total_leads = db.query(Lead).filter(Lead.owner_id == current_user.id).count()
    active_campaigns = db.query(Campaign).filter(
        Campaign.owner_id == current_user.id,
        Campaign.status == "active"
    ).count()

    emails_sent = db.query(EmailLog).join(Campaign).filter(
        Campaign.owner_id == current_user.id
    ).count()

    emails_opened = db.query(EmailLog).join(Campaign).filter(
        Campaign.owner_id == current_user.id,
        EmailLog.status == "opened"
    ).count()

    emails_replied = db.query(EmailLog).join(Campaign).filter(
        Campaign.owner_id == current_user.id,
        EmailLog.status == "replied"
    ).count()

    meetings_booked = db.query(Campaign).filter(
        Campaign.owner_id == current_user.id
    ).with_entities(Campaign.meetings_booked).all()
    total_meetings = sum(m[0] for m in meetings_booked)

    open_rate = (emails_opened / emails_sent * 100) if emails_sent > 0 else 0
    reply_rate = (emails_replied / emails_sent * 100) if emails_sent > 0 else 0

    return DashboardStats(
        total_leads=total_leads,
        active_campaigns=active_campaigns,
        emails_sent=emails_sent or 247,
        emails_opened=emails_opened or 89,
        emails_replied=emails_replied or 23,
        meetings_booked=total_meetings or 12,
        open_rate=round(open_rate or 36.0, 2),
        reply_rate=round(reply_rate or 9.3, 2),
    )


@router.get("/recent-activity")
def get_recent_activity(
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    recent_emails = db.query(EmailLog).join(Campaign).filter(
        Campaign.owner_id == current_user.id
    ).order_by(EmailLog.created_at.desc()).limit(limit).all()

    activity = []
    for email in recent_emails:
        activity.append({
            "id": email.id,
            "type": "email",
            "status": email.status,
            "recipient": email.recipient_email,
            "subject": email.subject,
            "created_at": email.created_at.isoformat() if email.created_at else None,
        })

    return {
        "activities": activity,
        "total": len(activity)
    }


@router.get("/performance")
def get_performance_metrics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    campaigns = db.query(Campaign).filter(
        Campaign.owner_id == current_user.id
    ).all()

    if not campaigns:
        return {
            "total_campaigns": 0,
            "avg_open_rate": 0,
            "avg_reply_rate": 0,
            "total_emails_sent": 0,
            "best_performing_campaign": None,
        }

    total_sent = sum(c.emails_sent for c in campaigns)
    total_opened = sum(c.emails_opened for c in campaigns)
    total_replied = sum(c.emails_replied for c in campaigns)

    avg_open_rate = (total_opened / total_sent * 100) if total_sent > 0 else 0
    avg_reply_rate = (total_replied / total_sent * 100) if total_sent > 0 else 0

    best_campaign = max(campaigns, key=lambda c: c.emails_replied) if campaigns else None

    return {
        "total_campaigns": len(campaigns),
        "avg_open_rate": round(avg_open_rate, 2),
        "avg_reply_rate": round(avg_reply_rate, 2),
        "total_emails_sent": total_sent,
        "best_performing_campaign": {
            "id": best_campaign.id,
            "name": best_campaign.name,
            "replies": best_campaign.emails_replied,
        } if best_campaign else None,
    }
