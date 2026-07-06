from sqlalchemy import create_engine, Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./oppora.db")

if DATABASE_URL.startswith("postgresql"):
    if "supabase" in DATABASE_URL and "sslmode=require" not in DATABASE_URL:
        DATABASE_URL += "&sslmode=require" if "?" in DATABASE_URL else "?sslmode=require"
    engine = create_engine(DATABASE_URL, pool_pre_ping=True, pool_size=10, max_overflow=20)
else:
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    company_name = Column(String)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    verification_otp = Column(String, nullable=True)
    reset_token = Column(String, nullable=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    leads = relationship("Lead", back_populates="owner")
    campaigns = relationship("Campaign", back_populates="owner")
    mailboxes = relationship("Mailbox", back_populates="owner")


class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    first_name = Column(String)
    last_name = Column(String)
    email = Column(String, index=True)
    company = Column(String)
    job_title = Column(String)
    phone = Column(String, nullable=True)
    linkedin_url = Column(String, nullable=True)
    industry = Column(String, nullable=True)
    company_size = Column(String, nullable=True)
    location = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    tags = Column(String, nullable=True)
    is_qualified = Column(Boolean, default=False)
    source = Column(String, nullable=True)
    hubspot_id = Column(String, nullable=True)
    zoho_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="leads")
    email_logs = relationship("EmailLog", back_populates="lead")


class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String, default="draft")
    subject_template = Column(String, nullable=True)
    body_template = Column(Text, nullable=True)
    ai_enabled = Column(Boolean, default=True)
    total_leads = Column(Integer, default=0)
    emails_sent = Column(Integer, default=0)
    emails_opened = Column(Integer, default=0)
    emails_replied = Column(Integer, default=0)
    meetings_booked = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="campaigns")
    email_logs = relationship("EmailLog", back_populates="campaign")


class Mailbox(Base):
    __tablename__ = "mailboxes"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    email_address = Column(String, nullable=False)
    provider = Column(String)
    daily_limit = Column(Integer, default=50)
    warmup_enabled = Column(Boolean, default=True)
    warmup_score = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)
    is_warmed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="mailboxes")


class EmailLog(Base):
    __tablename__ = "email_logs"

    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"))
    lead_id = Column(Integer, ForeignKey("leads.id"))
    sender_email = Column(String)
    recipient_email = Column(String)
    subject = Column(String)
    body = Column(Text)
    status = Column(String, default="pending")
    ai_personalized = Column(Boolean, default=False)
    opened_at = Column(DateTime, nullable=True)
    replied_at = Column(DateTime, nullable=True)
    sent_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    campaign = relationship("Campaign", back_populates="email_logs")
    lead = relationship("Lead", back_populates="email_logs")


class CRMIntegration(Base):
    __tablename__ = "crm_integrations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    crm_type = Column(String, nullable=False)
    access_token = Column(Text, nullable=True)
    refresh_token = Column(Text, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    last_sync = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    Base.metadata.create_all(bind=engine)
