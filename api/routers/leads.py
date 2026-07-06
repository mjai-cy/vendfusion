from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db, Lead, User
from models import LeadCreate, LeadUpdate, LeadResponse, BulkLeadImport
from auth import get_current_user

router = APIRouter(prefix="/api/leads", tags=["leads"])


@router.get("/", response_model=List[LeadResponse])
def get_leads(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    company: Optional[str] = None,
    is_qualified: Optional[bool] = None,
    tags: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Lead).filter(Lead.owner_id == current_user.id)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Lead.first_name.ilike(search_term)) |
            (Lead.last_name.ilike(search_term)) |
            (Lead.email.ilike(search_term)) |
            (Lead.company.ilike(search_term))
        )
    if company:
        query = query.filter(Lead.company.ilike(f"%{company}%"))
    if is_qualified is not None:
        query = query.filter(Lead.is_qualified == is_qualified)
    if tags:
        query = query.filter(Lead.tags.ilike(f"%{tags}%"))

    leads = query.offset(skip).limit(limit).all()
    return leads


@router.get("/{lead_id}", response_model=LeadResponse)
def get_lead(
    lead_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    lead = db.query(Lead).filter(
        Lead.id == lead_id,
        Lead.owner_id == current_user.id
    ).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead


@router.post("/", response_model=LeadResponse)
def create_lead(
    lead_data: LeadCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    existing = db.query(Lead).filter(
        Lead.email == lead_data.email,
        Lead.owner_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Lead with this email already exists")

    lead = Lead(
        owner_id=current_user.id,
        **lead_data.model_dump()
    )
    db.add(lead)
    db.commit()
    db.refresh(lead)
    return lead


@router.post("/bulk", response_model=List[LeadResponse])
def bulk_create_leads(
    import_data: BulkLeadImport,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    created_leads = []
    for lead_data in import_data.leads:
        existing = db.query(Lead).filter(
            Lead.email == lead_data.email,
            Lead.owner_id == current_user.id
        ).first()
        if not existing:
            lead = Lead(
                owner_id=current_user.id,
                **lead_data.model_dump()
            )
            db.add(lead)
            created_leads.append(lead)

    db.commit()
    for lead in created_leads:
        db.refresh(lead)
    return created_leads


@router.put("/{lead_id}", response_model=LeadResponse)
def update_lead(
    lead_id: int,
    lead_data: LeadUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    lead = db.query(Lead).filter(
        Lead.id == lead_id,
        Lead.owner_id == current_user.id
    ).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    update_data = lead_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(lead, key, value)

    db.commit()
    db.refresh(lead)
    return lead


@router.delete("/{lead_id}")
def delete_lead(
    lead_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    lead = db.query(Lead).filter(
        Lead.id == lead_id,
        Lead.owner_id == current_user.id
    ).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    db.delete(lead)
    db.commit()
    return {"message": "Lead deleted successfully"}


@router.get("/stats/summary")
def get_lead_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    total = db.query(Lead).filter(Lead.owner_id == current_user.id).count()
    qualified = db.query(Lead).filter(
        Lead.owner_id == current_user.id,
        Lead.is_qualified == True
    ).count()

    companies = db.query(Lead.company).filter(
        Lead.owner_id == current_user.id,
        Lead.company.isnot(None)
    ).distinct().count()

    return {
        "total_leads": total,
        "qualified_leads": qualified,
        "unique_companies": companies,
        "qualification_rate": (qualified / total * 100) if total > 0 else 0
    }
