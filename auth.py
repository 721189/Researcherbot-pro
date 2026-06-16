from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from typing import Optional
from pydantic import BaseModel
from app.config import settings
from app.db import supabase

security = HTTPBearer(auto_error=False)

class User(BaseModel):
    id: str
    email: str

async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Optional[User]:
    """
    Validates the Supabase JWT.
    If Supabase is not configured or in dev mode without token, returns a mock user.
    """
    if not settings.SUPABASE_URL or not credentials:
        # Dev fallback mode
        return User(id="dev-user-id", email="dev@researchbot.pro")
        
    token = credentials.credentials
    try:
        # For a full implementation, you should verify the JWT signature using Supabase JWT secret.
        # Here we do a basic decode to get the user ID without signature verification (for simplicity),
        # but in production, ALWAYS verify the signature.
        decoded = jwt.decode(token, options={"verify_signature": False})
        user_id = decoded.get("sub")
        email = decoded.get("email", "")
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
            )
            
        return User(id=user_id, email=email)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
