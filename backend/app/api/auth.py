from fastapi import APIRouter, HTTPException
from app.core.config import logger
from app.models.user import UserRequest, LoginRequest, LogoutRequest
from dynamodb_client import (
    get_user, create_user, verify_password,
    save_session_login, save_session_logout
)


router = APIRouter()

@router.post("/signup")
async def signup(user: UserRequest):
    user_item = get_user(user.username)
    if user_item:
        raise HTTPException(status_code=400, detail="Username already exists")

    create_user(user.username, user.email, user.password)
    save_session_login(user.username)
    
    return {"message": f"User {user.username} signed up successfully"}

@router.post("/login")
async def login(user: LoginRequest):
    user_item = get_user(user.username)
    if not user_item or not verify_password(user.password, user_item["password"]):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    save_session_login(user.username)

    return {"message": f"User {user.username} logged in successfully"}

@router.post("/logout")
async def signout(user: LogoutRequest):
    # Check that the user exists
    user_item = get_user(user.username)
    if not user_item:
        raise HTTPException(status_code=400, detail="User is not signed in or does not exist.")
    
    # Record logout in sessions table
    save_session_logout(user.username)
    return {"message": f"User {user.username} signed out successfully"}
