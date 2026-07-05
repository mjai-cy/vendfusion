from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from database import get_db, User, CRMIntegration, Lead
from models import LeadCreate, LeadResponse
from auth import get_current_user
from services import hubspot_service, zoho_service

router = APIRouter(prefix="/api/crm", tags=["crm"])


# ============ HubSpot Integration ============

@router.get("/hubspot/contacts")
def get_hubspot_contacts(
    limit: int = Query(100, le=100),
    current_user: User = Depends(get_current_user),
):
    """Get contacts from HubSpot"""
    result = hubspot_service.get_contacts(limit=limit)
    return result


@router.post("/hubspot/contacts")
def create_hubspot_contact(
    lead_data: LeadCreate,
    current_user: User = Depends(get_current_user),
):
    """Create a contact in HubSpot"""
    result = hubspot_service.create_contact(lead_data.model_dump())
    return result


@router.post("/hubspot/sync")
def sync_to_hubspot(
    lead_ids: List[int],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Sync leads to HubSpot"""
    leads = db.query(Lead).filter(
        Lead.id.in_(lead_ids),
        Lead.owner_id == current_user.id
    ).all()

    leads_data = []
    for lead in leads:
        leads_data.append({
            "email": lead.email,
            "first_name": lead.first_name,
            "last_name": lead.last_name,
            "company": lead.company,
            "job_title": lead.job_title,
            "phone": lead.phone,
        })

    result = hubspot_service.sync_contacts_to_hubspot(leads_data)

    for lead, hubspot_result in zip(leads, result.get("results", [])):
        if hubspot_result.get("success"):
            lead.hubspot_id = hubspot_result.get("hubspot_id")
    db.commit()

    return result


@router.delete("/hubspot/contacts/{hubspot_id}")
def delete_hubspot_contact(
    hubspot_id: str,
    current_user: User = Depends(get_current_user),
):
    """Delete a contact from HubSpot"""
    result = hubspot_service.delete_contact(hubspot_id)
    return result


# ============ Zoho Integration ============

@router.get("/zoho/auth-url")
def get_zoho_auth_url(
    current_user: User = Depends(get_current_user),
):
    """Get Zoho OAuth authorization URL"""
    url = zoho_service.get_auth_url()
    if not url:
        raise HTTPException(status_code=500, detail="Zoho not configured")
    return {"auth_url": url}


@router.post("/zoho/callback")
def zoho_callback(
    code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Handle Zoho OAuth callback"""
    result = zoho_service.exchange_code_for_token(code)

    if result.get("success"):
        integration = CRMIntegration(
            user_id=current_user.id,
            crm_type="zoho",
            access_token=result.get("access_token"),
            refresh_token=result.get("refresh_token"),
            is_active=True,
        )
        db.add(integration)
        db.commit()

    return result


@router.get("/zoho/contacts")
def get_zoho_contacts(
    page: int = Query(1, ge=1),
    per_page: int = Query(100, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get contacts from Zoho CRM"""
    integration = db.query(CRMIntegration).filter(
        CRMIntegration.user_id == current_user.id,
        CRMIntegration.crm_type == "zoho",
        CRMIntegration.is_active == True
    ).first()

    if not integration:
        raise HTTPException(status_code=400, detail="Zoho not connected. Please authenticate first.")

    if integration.refresh_token:
        token_result = zoho_service.refresh_access_token(integration.refresh_token)
        if token_result.get("success"):
            integration.access_token = token_result.get("access_token")
            db.commit()

    result = zoho_service.get_contacts(integration.access_token, page, per_page)
    return result


@router.post("/zoho/contacts")
def create_zoho_contact(
    lead_data: LeadCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a contact in Zoho CRM"""
    integration = db.query(CRMIntegration).filter(
        CRMIntegration.user_id == current_user.id,
        CRMIntegration.crm_type == "zoho",
        CRMIntegration.is_active == True
    ).first()

    if not integration:
        raise HTTPException(status_code=400, detail="Zoho not connected")

    result = zoho_service.create_contact(integration.access_token, lead_data.model_dump())
    return result


@router.post("/zoho/sync")
def sync_to_zoho(
    lead_ids: List[int],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Sync leads to Zoho CRM"""
    integration = db.query(CRMIntegration).filter(
        CRMIntegration.user_id == current_user.id,
        CRMIntegration.crm_type == "zoho",
        CRMIntegration.is_active == True
    ).first()

    if not integration:
        raise HTTPException(status_code=400, detail="Zoho not connected")

    leads = db.query(Lead).filter(
        Lead.id.in_(lead_ids),
        Lead.owner_id == current_user.id
    ).all()

    leads_data = []
    for lead in leads:
        leads_data.append({
            "email": lead.email,
            "first_name": lead.first_name,
            "last_name": lead.last_name,
            "company": lead.company,
            "job_title": lead.job_title,
            "phone": lead.phone,
        })

    result = zoho_service.sync_contacts_to_zoho(integration.access_token, leads_data)

    for lead, zoho_result in zip(leads, result.get("results", [])):
        if zoho_result.get("success"):
            lead.zoho_id = zoho_result.get("zoho_id")
    db.commit()

    return result


# ============ CRM Status ============

@router.get("/status")
def get_crm_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get status of all CRM integrations"""
    hubspot_configured = bool(hubspot_service.HUBSPOT_PRIVATE_APP_TOKEN)

    zoho_integration = db.query(CRMIntegration).filter(
        CRMIntegration.user_id == current_user.id,
        CRMIntegration.crm_type == "zoho",
        CRMIntegration.is_active == True
    ).first()

    return {
        "hubspot": {
            "configured": hubspot_configured,
            "connected": hubspot_configured,
        },
        "zoho": {
            "configured": bool(zoho_service.ZOHO_CLIENT_ID),
            "connected": zoho_integration is not None,
        }
    }
