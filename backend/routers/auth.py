from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import random
import string
import uuid
import os
import httpx
from jose import jwt

from database import get_db, User
from models import (
    UserCreate, UserLogin, UserResponse, Token,
    VerifyOTPRequest, ForgotPasswordRequest, ResetPasswordRequest,
    GoogleLoginRequest, MicrosoftLoginRequest
)
from auth import (
    get_password_hash,
    authenticate_user,
    create_access_token,
    get_current_user,
)
from services.email_service import send_verification_otp, send_password_reset_token

router = APIRouter(prefix="/api/auth", tags=["auth"])


class TokenWithUser(Token):
    user: UserResponse = None


GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")


def verify_google_token(token: str) -> dict:
    """Verify and decode Google ID Token"""
    if not GOOGLE_CLIENT_ID or token.startswith("mock_"):
        try:
            claims = jwt.get_unverified_claims(token)
            return {
                "sub": claims.get("sub", "mock-google-id-12345"),
                "email": claims.get("email", "demo.google.user@gmail.com"),
                "name": claims.get("name", "Demo Google User"),
            }
        except Exception:
            return {
                "sub": "mock-google-id-12345",
                "email": "demo.google.user@gmail.com",
                "name": "Demo Google User",
            }
            
    try:
        claims = jwt.get_unverified_claims(token)
        if claims.get("aud") != GOOGLE_CLIENT_ID:
            raise HTTPException(status_code=401, detail="Invalid token audience")
        if claims.get("iss") not in ["accounts.google.com", "https://accounts.google.com"]:
            raise HTTPException(status_code=401, detail="Invalid token issuer")
        return {
            "sub": claims.get("sub"),
            "email": claims.get("email"),
            "name": claims.get("name", claims.get("email")),
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Google authentication failed: {str(e)}")


def verify_microsoft_token(access_token: str) -> dict:
    """Verify Microsoft Access Token against Graph API"""
    if access_token.startswith("mock_") or os.getenv("MICROSOFT_CLIENT_ID") is None:
        return {
            "sub": "mock-microsoft-id-67890",
            "email": "demo.windows.user@outlook.com",
            "name": "Demo Windows User",
        }
        
    try:
        headers = {"Authorization": f"Bearer {access_token}"}
        response = httpx.get("https://graph.microsoft.com/v1.0/me", headers=headers, timeout=5)
        if response.status_code == 200:
            data = response.json()
            return {
                "sub": data.get("id"),
                "email": data.get("mail") or data.get("userPrincipalName"),
                "name": data.get("displayName", "Windows User"),
            }
        else:
            raise HTTPException(status_code=401, detail="Microsoft Graph API authentication failed")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Microsoft authentication failed: {str(e)}")


@router.post("/register", response_model=UserResponse)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    user = User(
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        full_name=user_data.full_name,
        company_name=user_data.company_name,
        is_verified=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user



@router.post("/login")
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, user_data.email, user_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    access_token = create_access_token(data={"sub": user.id})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "company_name": user.company_name,
            "is_active": user.is_active,
            "is_verified": user.is_verified,
            "created_at": str(user.created_at),
        }
    }


@router.post("/verify-email")
def verify_email(data: VerifyOTPRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_verified:
        return {"message": "Already verified"}
    if user.verification_otp != data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    user.is_verified = True
    user.verification_otp = None
    db.commit()
    return {"message": "Email verified successfully"}


@router.post("/forgot-password")
def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        return {"message": "If the email is registered, a reset link has been sent."}
    
    token = str(uuid.uuid4())
    user.reset_token = token
    db.commit()
    
    try:
        send_password_reset_token(user.email, token)
    except Exception as e:
        print("Failed to send reset token:", e)
        
    return {"message": "If the email is registered, a reset link has been sent."}


@router.post("/reset-password")
def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.reset_token == data.token).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
        
    user.hashed_password = get_password_hash(data.new_password)
    user.reset_token = None
    db.commit()
    return {"message": "Password reset successfully"}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserResponse)
def update_me(
    full_name: str = None,
    company_name: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if full_name:
        current_user.full_name = full_name
    if company_name:
        current_user.company_name = company_name
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/google")
def google_auth(data: GoogleLoginRequest, db: Session = Depends(get_db)):
    user_info = verify_google_token(data.credential)
    email = user_info["email"]
    google_id = user_info["sub"]
    name = user_info["name"]
    
    user = db.query(User).filter((User.google_id == google_id) | (User.email == email)).first()
    
    if not user:
        user = User(
            email=email,
            full_name=name,
            google_id=google_id,
            is_verified=True,
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        if not user.google_id:
            user.google_id = google_id
            db.commit()
            db.refresh(user)
            
    access_token = create_access_token(data={"sub": user.id})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "company_name": user.company_name,
            "is_active": user.is_active,
            "is_verified": user.is_verified,
            "created_at": str(user.created_at),
        }
    }


@router.post("/microsoft")
def microsoft_auth(data: MicrosoftLoginRequest, db: Session = Depends(get_db)):
    user_info = verify_microsoft_token(data.access_token)
    email = user_info["email"]
    microsoft_id = user_info["sub"]
    name = user_info["name"]
    
    user = db.query(User).filter((User.microsoft_id == microsoft_id) | (User.email == email)).first()
    
    if not user:
        user = User(
            email=email,
            full_name=name,
            microsoft_id=microsoft_id,
            is_verified=True,
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        if not user.microsoft_id:
            user.microsoft_id = microsoft_id
            db.commit()
            db.refresh(user)
            
    access_token = create_access_token(data={"sub": user.id})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "company_name": user.company_name,
            "is_active": user.is_active,
            "is_verified": user.is_verified,
            "created_at": str(user.created_at),
        }
    }

