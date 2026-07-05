from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db, Mailbox, User
from models import MailboxCreate, MailboxResponse
from auth import get_current_user

router = APIRouter(prefix="/api/mailboxes", tags=["mailboxes"])


@router.get("/", response_model=List[MailboxResponse])
def get_mailboxes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    mailboxes = db.query(Mailbox).filter(
        Mailbox.owner_id == current_user.id
    ).all()
    return mailboxes


@router.get("/{mailbox_id}", response_model=MailboxResponse)
def get_mailbox(
    mailbox_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    mailbox = db.query(Mailbox).filter(
        Mailbox.id == mailbox_id,
        Mailbox.owner_id == current_user.id
    ).first()
    if not mailbox:
        raise HTTPException(status_code=404, detail="Mailbox not found")
    return mailbox


@router.post("/", response_model=MailboxResponse)
def create_mailbox(
    mailbox_data: MailboxCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    existing = db.query(Mailbox).filter(
        Mailbox.email_address == mailbox_data.email_address,
        Mailbox.owner_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Mailbox already exists")

    mailbox = Mailbox(
        owner_id=current_user.id,
        **mailbox_data.model_dump()
    )
    db.add(mailbox)
    db.commit()
    db.refresh(mailbox)
    return mailbox


@router.delete("/{mailbox_id}")
def delete_mailbox(
    mailbox_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    mailbox = db.query(Mailbox).filter(
        Mailbox.id == mailbox_id,
        Mailbox.owner_id == current_user.id
    ).first()
    if not mailbox:
        raise HTTPException(status_code=404, detail="Mailbox not found")

    db.delete(mailbox)
    db.commit()
    return {"message": "Mailbox deleted successfully"}


@router.post("/{mailbox_id}/warmup")
def start_warmup(
    mailbox_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    mailbox = db.query(Mailbox).filter(
        Mailbox.id == mailbox_id,
        Mailbox.owner_id == current_user.id
    ).first()
    if not mailbox:
        raise HTTPException(status_code=404, detail="Mailbox not found")

    mailbox.warmup_enabled = True
    mailbox.warmup_score = min(mailbox.warmup_score + 10, 100)
    if mailbox.warmup_score >= 80:
        mailbox.is_warmed = True
    db.commit()

    return {
        "message": "Warmup started",
        "warmup_score": mailbox.warmup_score,
        "is_warmed": mailbox.is_warmed
    }


@router.post("/{mailbox_id}/toggle")
def toggle_mailbox(
    mailbox_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    mailbox = db.query(Mailbox).filter(
        Mailbox.id == mailbox_id,
        Mailbox.owner_id == current_user.id
    ).first()
    if not mailbox:
        raise HTTPException(status_code=404, detail="Mailbox not found")

    mailbox.is_active = not mailbox.is_active
    db.commit()

    return {
        "message": f"Mailbox {'activated' if mailbox.is_active else 'deactivated'}",
        "is_active": mailbox.is_active
    }


@router.get("/stats/overview")
def get_mailbox_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    mailboxes = db.query(Mailbox).filter(
        Mailbox.owner_id == current_user.id
    ).all()

    total = len(mailboxes)
    active = sum(1 for m in mailboxes if m.is_active)
    warmed = sum(1 for m in mailboxes if m.is_warmed)
    total_daily_limit = sum(m.daily_limit for m in mailboxes)
    avg_warmup = sum(m.warmup_score for m in mailboxes) / total if total > 0 else 0

    return {
        "total_mailboxes": total,
        "active_mailboxes": active,
        "warmed_mailboxes": warmed,
        "total_daily_limit": total_daily_limit,
        "average_warmup_score": round(avg_warmup, 2)
    }
