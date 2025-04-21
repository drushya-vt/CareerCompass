from fastapi import APIRouter, HTTPException
from app.core.config import logger
from app.models.user import UserRequest, LoginRequest
from app.core.auth import fake_users_db, logged_in_users, save_users

router = APIRouter()

@router.post("/signup")
async def signup(user: UserRequest):
    logger.debug(f"Received signup request for username: {user.username}")
    logger.debug(f"Request data: {user.dict()}")
    
    try:
        if user.username in fake_users_db:
            logger.warning(f"Signup failed - username already exists: {user.username}")
            raise HTTPException(status_code=400, detail="Username already exists")
        
        # Add user to database
        fake_users_db[user.username] = {
            "password": user.password,
            "email": user.email
        }
        
        # Save updated user database to file
        save_users(fake_users_db)
        
        logger.info(f"User registered successfully: {user.username}")
        logger.debug(f"Current users in db: {list(fake_users_db.keys())}")
        
        return {"message": "User registered successfully"}
        
    except Exception as e:
        logger.error(f"Error during signup: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/login")
async def login(user: LoginRequest):
    if user.username in fake_users_db and fake_users_db[user.username]["password"] == user.password:
        logged_in_users[user.username] = True
        return {"message": f"User {user.username} signed in successfully"}
    raise HTTPException(
        status_code=401, 
        detail="Invalid username or password"
    )

@router.post("/logout")
async def signout(user: UserRequest):
    if user.username in logged_in_users:
        del logged_in_users[user.username]  # Remove user from the logged-in list
        return {"message": f"User {user.username} signed out successfully"}
    
    raise HTTPException(status_code=400, detail="User is not signed in or session expired")
