from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import random
import string
import uuid

from database import get_db, User
from models import (
    UserCreate, UserLogin, UserResponse, Token,
    VerifyOTPRequest, ForgotPasswordRequest, ResetPasswordRequest
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

@router.post("/register", response_model=UserResponse)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    otp = ''.join(random.choices(string.digits, k=6))
    user = User(
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        full_name=user_data.full_name,
        company_name=user_data.company_name,
        verification_otp=otp,
        is_verified=False
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    try:
        send_verification_otp(user.email, otp)
    except Exception as e:
        print("Failed to send OTP:", e)
        
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
