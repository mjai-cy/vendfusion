from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    company_name: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str]
    company_name: Optional[str]
    is_active: bool
    is_verified: bool = False
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


class LeadCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    company: str
    job_title: Optional[str] = None
    phone: Optional[str] = None
    linkedin_url: Optional[str] = None
    industry: Optional[str] = None
    company_size: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None
    tags: Optional[str] = None


class LeadUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    company: Optional[str] = None
    job_title: Optional[str] = None
    phone: Optional[str] = None
    linkedin_url: Optional[str] = None
    industry: Optional[str] = None
    company_size: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None
    tags: Optional[str] = None
    is_qualified: Optional[bool] = None


class LeadResponse(BaseModel):
    id: int
    first_name: Optional[str]
    last_name: Optional[str]
    email: str
    company: Optional[str]
    job_title: Optional[str]
    phone: Optional[str]
    linkedin_url: Optional[str]
    industry: Optional[str]
    company_size: Optional[str]
    location: Optional[str]
    notes: Optional[str]
    tags: Optional[str]
    is_qualified: bool
    created_at: datetime

    class Config:
        from_attributes = True


class CampaignCreate(BaseModel):
    name: str
    description: Optional[str] = None
    subject_template: Optional[str] = None
    body_template: Optional[str] = None
    ai_enabled: bool = True


class CampaignUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    subject_template: Optional[str] = None
    body_template: Optional[str] = None
    ai_enabled: Optional[bool] = None


class CampaignResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    status: str
    subject_template: Optional[str]
    body_template: Optional[str]
    ai_enabled: bool
    total_leads: int
    emails_sent: int
    emails_opened: int
    emails_replied: int
    meetings_booked: int
    created_at: datetime

    class Config:
        from_attributes = True


class MailboxCreate(BaseModel):
    email_address: EmailStr
    provider: Optional[str] = None
    daily_limit: int = 50
    warmup_enabled: bool = True


class MailboxResponse(BaseModel):
    id: int
    email_address: str
    provider: Optional[str]
    daily_limit: int
    warmup_enabled: bool
    warmup_score: float
    is_active: bool
    is_warmed: bool
    created_at: datetime

    class Config:
        from_attributes = True


class EmailLogResponse(BaseModel):
    id: int
    campaign_id: int
    lead_id: int
    sender_email: str
    recipient_email: str
    subject: str
    body: str
    status: str
    ai_personalized: bool
    opened_at: Optional[datetime]
    replied_at: Optional[datetime]
    sent_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class AIEmailRequest(BaseModel):
    lead_id: int
    campaign_id: int
    tone: str = "professional"
    additional_context: Optional[str] = None


class AIEmailResponse(BaseModel):
    subject: str
    body: str
    personalization_notes: str


class DashboardStats(BaseModel):
    total_leads: int
    active_campaigns: int
    emails_sent: int
    emails_opened: int
    emails_replied: int
    meetings_booked: int
    open_rate: float
    reply_rate: float


class BulkLeadImport(BaseModel):
    leads: List[LeadCreate]
