from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Header
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
import asyncio
from datetime import datetime, timezone, timedelta
from emergentintegrations.llm.chat import LlmChat, UserMessage
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="RobotiX Connect API", version="1.0.0", description="Robotics Maintenance Brokerage Platform")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Rate limiting storage
from collections import defaultdict
rate_limit_storage = defaultdict(list)

# ===== Models =====

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    picture: Optional[str] = None
    role: str  # 'warehouse', 'technician', 'admin'
    specializations: Optional[List[str]] = []  # For technicians
    location: Optional[str] = None
    phone: Optional[str] = None
    verified: bool = False  # For technicians
    rating: float = 0.0
    total_reviews: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Job(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    warehouse_id: str
    warehouse_name: str
    title: str
    equipment_type: str
    issue_description: str
    location: str
    urgency: str  # 'low', 'medium', 'high'
    status: str = "open"  # 'open', 'accepted', 'in_progress', 'completed', 'paid'
    budget: float
    assigned_tech_id: Optional[str] = None
    assigned_tech_name: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    accepted_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

class JobCreate(BaseModel):
    title: str = Field(..., min_length=5, max_length=200, description="Job title")
    equipment_type: str = Field(..., min_length=2, max_length=100, description="Equipment type")
    issue_description: str = Field(..., min_length=10, max_length=2000, description="Issue description")
    location: str = Field(..., min_length=3, max_length=200, description="Job location")
    urgency: str = Field(..., pattern="^(low|medium|high)$", description="Urgency level")
    budget: float = Field(..., gt=0, le=100000, description="Budget in USD")

class Application(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    job_id: str
    tech_id: str
    tech_name: str
    message: Optional[str] = None
    status: str  # 'pending', 'accepted', 'rejected'
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ApplicationCreate(BaseModel):
    job_id: str
    message: Optional[str] = None

class Transaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    job_id: str
    warehouse_id: str
    tech_id: str
    amount: float
    platform_commission: float
    platform_commission_rate: float  # Store the rate used
    tech_payout: float
    emergency_fee: float = 0.0
    diagnostics_fee: float = 0.0
    subscription_discount: float = 0.0
    stripe_session_id: Optional[str] = None
    payment_status: str  # 'pending', 'paid', 'completed'
    payout_status: str = 'pending'  # 'pending', 'processed'
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Subscription(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    warehouse_id: str
    plan_type: str  # 'basic', 'standard', 'enterprise'
    price: float
    visits_per_month: int
    status: str  # 'active', 'cancelled', 'expired'
    visits_used: int = 0
    current_period_start: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    current_period_end: datetime = Field(default_factory=lambda: datetime.now(timezone.utc) + timedelta(days=30))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
class TechnicianVerification(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tech_id: str
    verification_fee_paid: bool = False
    verification_fee_amount: float = 49.0
    background_check_status: str = 'pending'  # 'pending', 'completed', 'failed'
    stripe_payment_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Review(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    job_id: str
    reviewer_id: str
    reviewer_name: str
    reviewee_id: str
    rating: int  # 1-5
    comment: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ReviewCreate(BaseModel):
    job_id: str = Field(..., min_length=1, description="Job ID")
    reviewee_id: str = Field(..., min_length=1, description="User being reviewed")
    rating: int = Field(..., ge=1, le=5, description="Rating from 1 to 5")
    comment: Optional[str] = Field(None, min_length=10, max_length=1000, description="Review comment")

class CheckoutRequest(BaseModel):
    job_id: str
    origin_url: str

# ===== Security & Rate Limiting =====

def check_rate_limit(identifier: str, max_requests: int = 100, window_seconds: int = 60) -> bool:
    """Simple rate limiting check"""
    now = datetime.now(timezone.utc)
    cutoff = now.timestamp() - window_seconds
    
    # Clean old entries
    rate_limit_storage[identifier] = [ts for ts in rate_limit_storage[identifier] if ts > cutoff]
    
    # Check limit
    if len(rate_limit_storage[identifier]) >= max_requests:
        return False
    
    # Add new request
    rate_limit_storage[identifier].append(now.timestamp())
    return True

def sanitize_input(text: str) -> str:
    """Basic input sanitization"""
    if not text:
        return text
    # Remove potential script tags and dangerous characters
    dangerous_patterns = ['<script', 'javascript:', 'onerror=', 'onclick=']
    sanitized = text
    for pattern in dangerous_patterns:
        sanitized = sanitized.replace(pattern, '')
    return sanitized.strip()

# ===== Auth Helpers =====

async def get_current_user(authorization: Optional[str] = None, session_token: Optional[str] = None) -> Optional[User]:
    """Get current user from session token in Authorization header or cookie"""
    token = None
    
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
    elif session_token:
        token = session_token
    
    if not token or len(token) > 500:  # Prevent token abuse
        return None
    
    # Find session
    session_doc = await db.user_sessions.find_one({"session_token": token})
    if not session_doc:
        return None
    
    # Check if session expired
    expires_at = session_doc.get('expires_at')
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    
    # Ensure expires_at is timezone-aware
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if expires_at < datetime.now(timezone.utc):
        # Clean up expired session
        await db.user_sessions.delete_one({"session_token": token})
        return None
    
    # Get user
    user_doc = await db.users.find_one({"id": session_doc['user_id']}, {"_id": 0})
    if not user_doc:
        return None
    
    return User(**user_doc)

# ===== Auth Endpoints =====

@api_router.post("/auth/session")
async def create_session(request: Request):
    """Process session_id from Google OAuth and create user session"""
    # Rate limiting
    client_ip = request.client.host if request.client else "unknown"
    if not check_rate_limit(f"auth_session_{client_ip}", max_requests=10, window_seconds=60):
        raise HTTPException(status_code=429, detail="Too many authentication attempts. Please try again later.")
    
    session_id = request.headers.get("X-Session-ID")
    if not session_id or len(session_id) > 500:
        raise HTTPException(status_code=400, detail="Invalid session ID")
    
    # Get session data from Emergent Auth
    import aiohttp
    async with aiohttp.ClientSession() as session:
        async with session.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id}
        ) as resp:
            if resp.status != 200:
                raise HTTPException(status_code=401, detail="Invalid session")
            data = await resp.json()
    
    # Check if user exists
    user_doc = await db.users.find_one({"email": data['email']}, {"_id": 0})
    
    if not user_doc:
        # Create new user - ask for role
        return {"needs_role": True, "user_data": data}
    
    user = User(**user_doc)
    
    # Create session
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    session_doc = {
        "user_id": user.id,
        "session_token": data['session_token'],
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.user_sessions.insert_one(session_doc)
    
    return {
        "user": user.model_dump(),
        "session_token": data['session_token']
    }

@api_router.post("/auth/register")
async def register_user(request: Request):
    """Complete registration with role selection"""
    body = await request.json()
    session_id = request.headers.get("X-Session-ID")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="Session ID required")
    
    # Get session data
    import aiohttp
    async with aiohttp.ClientSession() as session:
        async with session.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id}
        ) as resp:
            if resp.status != 200:
                raise HTTPException(status_code=401, detail="Invalid session")
            data = await resp.json()
    
    # Create user
    user = User(
        email=data['email'],
        name=data['name'],
        picture=data.get('picture'),
        role=body.get('role'),
        location=body.get('location'),
        phone=body.get('phone'),
        specializations=body.get('specializations', [])
    )
    
    user_doc = user.model_dump()
    user_doc['created_at'] = user_doc['created_at'].isoformat()
    await db.users.insert_one(user_doc)
    
    # Create session
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    session_doc = {
        "user_id": user.id,
        "session_token": data['session_token'],
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.user_sessions.insert_one(session_doc)
    
    return {
        "user": user.model_dump(),
        "session_token": data['session_token']
    }

@api_router.get("/auth/me")
async def get_me(
    request: Request,
    authorization: Optional[str] = Header(None)
):
    """Get current user"""
    session_token = request.cookies.get("session_token")
    user = await get_current_user(authorization, session_token)
    
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    return user

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    """Logout user"""
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    
    response.delete_cookie("session_token")
    return {"message": "Logged out"}

# ===== Job Endpoints =====

@api_router.post("/jobs", response_model=Job)
async def create_job(
    job_data: JobCreate,
    request: Request,
    authorization: Optional[str] = Header(None)
):
    """Create a new job (warehouse only)"""
    session_token = request.cookies.get("session_token")
    user = await get_current_user(authorization, session_token)
    
    if not user or user.role != 'warehouse':
        raise HTTPException(status_code=403, detail="Only warehouses can post jobs")
    
    # Check subscription status for priority features
    subscription = await db.subscriptions.find_one({
        "warehouse_id": user.id,
        "status": "active",
        "current_period_end": {"$gte": datetime.now(timezone.utc).isoformat()}
    })
    
    # Rate limiting - higher for subscribers
    max_jobs = 50 if subscription else 20
    if not check_rate_limit(f"create_job_{user.id}", max_requests=max_jobs, window_seconds=3600):
        raise HTTPException(status_code=429, detail="Job posting limit reached. Upgrade to Premium for unlimited posts.")
    
    # Sanitize text inputs
    job = Job(
        warehouse_id=user.id,
        warehouse_name=user.name,
        title=sanitize_input(job_data.title),
        equipment_type=sanitize_input(job_data.equipment_type),
        issue_description=sanitize_input(job_data.issue_description),
        location=sanitize_input(job_data.location),
        urgency=job_data.urgency,
        budget=job_data.budget,
        status="open"
    )
    
    job_doc = job.model_dump()
    job_doc['created_at'] = job_doc['created_at'].isoformat()
    
    # Priority flag for subscribers
    if subscription:
        job_doc['priority'] = True
        job_doc['subscription_plan'] = subscription.get('plan_type')
    
    await db.jobs.insert_one(job_doc)
    
    return job

@api_router.get("/jobs", response_model=List[Job])
async def get_jobs(
    status: Optional[str] = None,
    request: Request = None,
    authorization: Optional[str] = Header(None)
):
    """Get all jobs"""
    session_token = request.cookies.get("session_token") if request else None
    user = await get_current_user(authorization, session_token)
    
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    query = {}
    if status:
        query['status'] = status
    
    # Filter based on role
    if user.role == 'warehouse':
        query['warehouse_id'] = user.id
    elif user.role == 'technician':
        # Show open jobs or jobs assigned to this tech
        query = {"$or": [
            {"status": "open"},
            {"assigned_tech_id": user.id}
        ]}
    
    jobs = await db.jobs.find(query, {"_id": 0}).to_list(1000)
    
    for job in jobs:
        if isinstance(job.get('created_at'), str):
            job['created_at'] = datetime.fromisoformat(job['created_at'])
        if job.get('accepted_at') and isinstance(job['accepted_at'], str):
            job['accepted_at'] = datetime.fromisoformat(job['accepted_at'])
        if job.get('completed_at') and isinstance(job['completed_at'], str):
            job['completed_at'] = datetime.fromisoformat(job['completed_at'])
    
    return jobs

@api_router.get("/jobs/{job_id}", response_model=Job)
async def get_job(
    job_id: str,
    request: Request,
    authorization: Optional[str] = Header(None)
):
    """Get specific job"""
    session_token = request.cookies.get("session_token")
    user = await get_current_user(authorization, session_token)
    
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    job_doc = await db.jobs.find_one({"id": job_id}, {"_id": 0})
    if not job_doc:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if isinstance(job_doc.get('created_at'), str):
        job_doc['created_at'] = datetime.fromisoformat(job_doc['created_at'])
    if job_doc.get('accepted_at') and isinstance(job_doc['accepted_at'], str):
        job_doc['accepted_at'] = datetime.fromisoformat(job_doc['accepted_at'])
    if job_doc.get('completed_at') and isinstance(job_doc['completed_at'], str):
        job_doc['completed_at'] = datetime.fromisoformat(job_doc['completed_at'])
    
    return Job(**job_doc)

@api_router.post("/jobs/{job_id}/accept")
async def accept_job(
    job_id: str,
    request: Request,
    authorization: Optional[str] = Header(None)
):
    """Accept a job (technician only)"""
    session_token = request.cookies.get("session_token")
    user = await get_current_user(authorization, session_token)
    
    if not user or user.role != 'technician':
        raise HTTPException(status_code=403, detail="Only technicians can accept jobs")
    
    job_doc = await db.jobs.find_one({"id": job_id})
    if not job_doc or job_doc['status'] != 'open':
        raise HTTPException(status_code=400, detail="Job not available")
    
    await db.jobs.update_one(
        {"id": job_id},
        {"$set": {
            "status": "accepted",
            "assigned_tech_id": user.id,
            "assigned_tech_name": user.name,
            "accepted_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"message": "Job accepted"}

@api_router.post("/jobs/{job_id}/complete")
async def complete_job(
    job_id: str,
    request: Request,
    authorization: Optional[str] = Header(None)
):
    """Mark job as completed (technician only)"""
    session_token = request.cookies.get("session_token")
    user = await get_current_user(authorization, session_token)
    
    if not user or user.role != 'technician':
        raise HTTPException(status_code=403, detail="Only technicians can complete jobs")
    
    job_doc = await db.jobs.find_one({"id": job_id})
    if not job_doc or job_doc['assigned_tech_id'] != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.jobs.update_one(
        {"id": job_id},
        {"$set": {
            "status": "completed",
            "completed_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"message": "Job marked as completed"}

# ===== AI Matching Endpoint =====

@api_router.get("/jobs/{job_id}/matches")
async def get_job_matches(
    job_id: str,
    request: Request,
    authorization: Optional[str] = Header(None)
):
    """Get AI-powered technician matches for a job"""
    session_token = request.cookies.get("session_token")
    user = await get_current_user(authorization, session_token)
    
    if not user or user.role != 'warehouse':
        raise HTTPException(status_code=403, detail="Only warehouses can view matches")
    
    # Get job
    job_doc = await db.jobs.find_one({"id": job_id}, {"_id": 0})
    if not job_doc:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Get all verified technicians
    techs = await db.users.find({"role": "technician", "verified": True}, {"_id": 0}).to_list(100)
    
    if not techs:
        return {"matches": [], "message": "No verified technicians available", "technicians": []}
    
    # Use GPT-5 for matching with timeout handling
    try:
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        chat = LlmChat(
            api_key=api_key,
            session_id=f"job-match-{job_id}",
            system_message="You are an AI assistant helping match robotics technicians to maintenance jobs. Be concise and provide top 3 matches."
        )
        chat.with_model("openai", "gpt-5")
        
        prompt = f"""
Job: {job_doc['title']} | Equipment: {job_doc['equipment_type']} | Location: {job_doc['location']} | Budget: ${job_doc['budget']}

Technicians:
{chr(10).join([f"{i+1}. {t['name']} - {t.get('location', 'N/A')} - {', '.join(t.get('specializations', [])[:2])} - {t.get('rating', 0)}/5" for i, t in enumerate(techs[:10])])}

List top 3 matches with brief reason (1 sentence each).
"""
        
        user_message = UserMessage(text=prompt)
        
        # Use asyncio.wait_for with 45 second timeout
        import asyncio
        response = await asyncio.wait_for(chat.send_message(user_message), timeout=45.0)
        
        return {
            "job": job_doc,
            "ai_recommendation": response,
            "technicians": techs
        }
    except asyncio.TimeoutError:
        # Fallback to simple matching if AI times out
        return {
            "job": job_doc,
            "ai_recommendation": "AI matching temporarily unavailable. Showing all verified technicians sorted by rating.",
            "technicians": sorted(techs, key=lambda x: x.get('rating', 0), reverse=True)
        }
    except Exception:
        # Fallback on any error
        return {
            "job": job_doc,
            "ai_recommendation": "AI matching unavailable. Showing all verified technicians.",
            "technicians": techs
        }

# ===== Payment Endpoints =====

@api_router.post("/payments/checkout")
async def create_checkout(
    checkout_data: CheckoutRequest,
    request: Request,
    authorization: Optional[str] = Header(None)
):
    """Create Stripe checkout session for job payment"""
    session_token = request.cookies.get("session_token")
    user = await get_current_user(authorization, session_token)
    
    if not user or user.role != 'warehouse':
        raise HTTPException(status_code=403, detail="Only warehouses can make payments")
    
    # Get job
    job_doc = await db.jobs.find_one({"id": checkout_data.job_id})
    if not job_doc:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job_doc['warehouse_id'] != user.id:
        raise HTTPException(status_code=403, detail="Not your job")
    
    if job_doc['status'] != 'completed':
        raise HTTPException(status_code=400, detail="Job must be completed first")
    
    # Calculate commission based on urgency
    amount = float(job_doc['budget'])
    urgency = job_doc.get('urgency', 'medium')
    
    # Dynamic commission rates
    commission_rates = {
        'low': 0.10,      # 10% for low urgency
        'medium': 0.15,   # 15% for medium urgency
        'high': 0.25      # 25% for emergency/high urgency
    }
    commission_rate = commission_rates.get(urgency, 0.15)
    
    # Emergency dispatch fee (for high urgency)
    emergency_fee = 50.0 if urgency == 'high' else 0.0  # Platform keeps 30% of $199 emergency fee
    
    # Check for subscription discount
    subscription = await db.subscriptions.find_one({
        "warehouse_id": user.id,
        "status": "active"
    })
    
    discount_rate = 0.0
    if subscription:
        plan_discounts = {'basic': 0.05, 'standard': 0.10, 'enterprise': 0.15}
        discount_rate = plan_discounts.get(subscription.get('plan_type'), 0.0)
    
    discount_amount = amount * discount_rate
    
    # Calculate final amounts
    commission = amount * commission_rate
    tech_payout = amount - commission - discount_amount + (emergency_fee * 0.7 if emergency_fee > 0 else 0)
    
    # Diagnostics fee (if applicable)
    diagnostics_fee = 0.0  # Would be added if diagnostic was performed before repair
    
    # Initialize Stripe
    api_key = os.environ.get('STRIPE_API_KEY')
    host_url = checkout_data.origin_url
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url=webhook_url)
    
    # Create checkout session
    success_url = f"{host_url}/payment-success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{host_url}/dashboard"
    
    checkout_request = CheckoutSessionRequest(
        amount=amount,
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "job_id": checkout_data.job_id,
            "warehouse_id": user.id,
            "tech_id": job_doc['assigned_tech_id']
        }
    )
    
    session = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Create transaction record
    transaction = Transaction(
        job_id=checkout_data.job_id,
        warehouse_id=user.id,
        tech_id=job_doc['assigned_tech_id'],
        amount=amount,
        platform_commission=commission,
        platform_commission_rate=commission_rate,
        tech_payout=tech_payout,
        emergency_fee=emergency_fee,
        diagnostics_fee=diagnostics_fee,
        subscription_discount=discount_amount,
        stripe_session_id=session.session_id,
        payment_status="pending"
    )
    
    trans_doc = transaction.model_dump()
    trans_doc['created_at'] = trans_doc['created_at'].isoformat()
    await db.payment_transactions.insert_one(trans_doc)
    
    return {"checkout_url": session.url, "session_id": session.session_id}

@api_router.get("/payments/status/{session_id}")
async def check_payment_status(
    session_id: str,
    request: Request,
    authorization: Optional[str] = Header(None)
):
    """Check payment status"""
    session_token = request.cookies.get("session_token")
    user = await get_current_user(authorization, session_token)
    
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    # Get transaction
    trans_doc = await db.payment_transactions.find_one({"stripe_session_id": session_id})
    if not trans_doc:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # Check Stripe status
    api_key = os.environ.get('STRIPE_API_KEY')
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url="")
    status = await stripe_checkout.get_checkout_status(session_id)
    
    # Update transaction if paid and not already updated
    if status.payment_status == "paid" and trans_doc['payment_status'] != "completed":
        await db.payment_transactions.update_one(
            {"stripe_session_id": session_id},
            {"$set": {"payment_status": "completed"}}
        )
        
        # Update job status
        await db.jobs.update_one(
            {"id": trans_doc['job_id']},
            {"$set": {"status": "paid"}}
        )
    
    return status

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhooks"""
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    api_key = os.environ.get('STRIPE_API_KEY')
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url="")
    
    try:
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        if webhook_response.payment_status == "paid":
            # Update transaction
            await db.payment_transactions.update_one(
                {"stripe_session_id": webhook_response.session_id},
                {"$set": {"payment_status": "completed"}}
            )
            
            # Update job
            trans_doc = await db.payment_transactions.find_one({"stripe_session_id": webhook_response.session_id})
            if trans_doc:
                await db.jobs.update_one(
                    {"id": trans_doc['job_id']},
                    {"$set": {"status": "paid"}}
                )
        
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ===== Review Endpoints =====

@api_router.post("/reviews", response_model=Review)
async def create_review(
    review_data: ReviewCreate,
    request: Request,
    authorization: Optional[str] = Header(None)
):
    """Create a review"""
    session_token = request.cookies.get("session_token")
    user = await get_current_user(authorization, session_token)
    
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    # Check job exists and user is part of it
    job_doc = await db.jobs.find_one({"id": review_data.job_id})
    if not job_doc:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if user.id not in [job_doc['warehouse_id'], job_doc.get('assigned_tech_id')]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    review = Review(
        reviewer_id=user.id,
        reviewer_name=user.name,
        **review_data.model_dump()
    )
    
    review_doc = review.model_dump()
    review_doc['created_at'] = review_doc['created_at'].isoformat()
    await db.reviews.insert_one(review_doc)
    
    # Update reviewee rating
    reviews = await db.reviews.find({"reviewee_id": review_data.reviewee_id}).to_list(1000)
    avg_rating = sum(r['rating'] for r in reviews) / len(reviews)
    await db.users.update_one(
        {"id": review_data.reviewee_id},
        {"$set": {"rating": avg_rating, "total_reviews": len(reviews)}}
    )
    
    return review

@api_router.get("/reviews/{user_id}")
async def get_user_reviews(user_id: str):
    """Get reviews for a user"""
    reviews = await db.reviews.find({"reviewee_id": user_id}, {"_id": 0}).to_list(100)
    
    for review in reviews:
        if isinstance(review.get('created_at'), str):
            review['created_at'] = datetime.fromisoformat(review['created_at'])
    
    return reviews

# ===== Subscription Endpoints =====

@api_router.get("/subscriptions/plans")
async def get_subscription_plans():
    """Get available subscription plans"""
    plans = [
        {
            "id": "basic",
            "name": "Basic",
            "price": 199,
            "visits_per_month": 1,
            "features": [
                "1 preventive visit per month",
                "Discounted repair rates (5% off)",
                "Priority support",
                "Free diagnostics"
            ]
        },
        {
            "id": "standard",
            "name": "Standard",
            "price": 399,
            "visits_per_month": 2,
            "popular": True,
            "features": [
                "2 preventive visits per month",
                "Discounted repair rates (10% off)",
                "Priority technician matching",
                "Free diagnostics",
                "24/7 phone support",
                "No emergency dispatch fee"
            ]
        },
        {
            "id": "enterprise",
            "name": "Enterprise",
            "price": 799,
            "visits_per_month": 4,
            "features": [
                "4 preventive visits per month",
                "Discounted repair rates (15% off)",
                "Dedicated account manager",
                "Free diagnostics",
                "24/7 priority hotline",
                "Free emergency dispatch",
                "Quarterly health reports",
                "Parts discount (10%)"
            ]
        }
    ]
    return plans

@api_router.post("/subscriptions/subscribe")
async def subscribe_to_plan(
    request: Request,
    authorization: Optional[str] = Header(None)
):
    """Subscribe to a maintenance plan"""
    session_token = request.cookies.get("session_token")
    user = await get_current_user(authorization, session_token)
    
    if not user or user.role != 'warehouse':
        raise HTTPException(status_code=403, detail="Only warehouses can subscribe")
    
    body = await request.json()
    plan_type = body.get('plan_type')
    
    # Plan pricing
    plan_prices = {"basic": 199, "standard": 399, "enterprise": 799}
    plan_visits = {"basic": 1, "standard": 2, "enterprise": 4}
    
    if plan_type not in plan_prices:
        raise HTTPException(status_code=400, detail="Invalid plan type")
    
    # Check for existing active subscription
    existing = await db.subscriptions.find_one({
        "warehouse_id": user.id,
        "status": "active"
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="You already have an active subscription")
    
    # Create subscription
    subscription = Subscription(
        warehouse_id=user.id,
        plan_type=plan_type,
        price=plan_prices[plan_type],
        visits_per_month=plan_visits[plan_type],
        status="active"
    )
    
    sub_doc = subscription.model_dump()
    sub_doc['current_period_start'] = sub_doc['current_period_start'].isoformat()
    sub_doc['current_period_end'] = sub_doc['current_period_end'].isoformat()
    sub_doc['created_at'] = sub_doc['created_at'].isoformat()
    
    await db.subscriptions.insert_one(sub_doc)
    
    return {
        "message": f"Successfully subscribed to {plan_type.title()} plan",
        "subscription": subscription.model_dump()
    }

@api_router.get("/subscriptions/my-subscription")
async def get_my_subscription(
    request: Request,
    authorization: Optional[str] = Header(None)
):
    """Get current subscription"""
    session_token = request.cookies.get("session_token")
    user = await get_current_user(authorization, session_token)
    
    if not user or user.role != 'warehouse':
        raise HTTPException(status_code=403, detail="Only warehouses have subscriptions")
    
    subscription = await db.subscriptions.find_one({
        "warehouse_id": user.id,
        "status": "active"
    }, {"_id": 0})
    
    if not subscription:
        return {"subscription": None}
    
    return {"subscription": subscription}

@api_router.post("/subscriptions/cancel")
async def cancel_subscription(
    request: Request,
    authorization: Optional[str] = Header(None)
):
    """Cancel subscription"""
    session_token = request.cookies.get("session_token")
    user = await get_current_user(authorization, session_token)
    
    if not user or user.role != 'warehouse':
        raise HTTPException(status_code=403, detail="Only warehouses can cancel subscriptions")
    
    result = await db.subscriptions.update_one(
        {"warehouse_id": user.id, "status": "active"},
        {"$set": {"status": "cancelled"}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="No active subscription found")
    
    return {"message": "Subscription cancelled successfully"}

# ===== Technician Verification & Onboarding =====

@api_router.post("/technicians/pay-verification-fee")
async def pay_verification_fee(
    request: Request,
    authorization: Optional[str] = Header(None)
):
    """Pay technician verification fee"""
    session_token = request.cookies.get("session_token")
    user = await get_current_user(authorization, session_token)
    
    if not user or user.role != 'technician':
        raise HTTPException(status_code=403, detail="Only technicians can pay verification fee")
    
    # Check if already paid
    existing = await db.technician_verifications.find_one({"tech_id": user.id})
    if existing and existing.get('verification_fee_paid'):
        raise HTTPException(status_code=400, detail="Verification fee already paid")
    
    # Create verification record
    verification = TechnicianVerification(
        tech_id=user.id,
        verification_fee_paid=True,
        verification_fee_amount=49.0
    )
    
    ver_doc = verification.model_dump()
    ver_doc['created_at'] = ver_doc['created_at'].isoformat()
    
    await db.technician_verifications.insert_one(ver_doc)
    
    return {
        "message": "Verification fee payment recorded. Background check will be completed within 48 hours.",
        "amount": 49.0
    }

# ===== Revenue Analytics =====

@api_router.get("/admin/revenue-analytics")
async def get_revenue_analytics(
    request: Request,
    authorization: Optional[str] = Header(None)
):
    """Get detailed revenue analytics (admin only)"""
    session_token = request.cookies.get("session_token")
    user = await get_current_user(authorization, session_token)
    
    if not user or user.role != 'admin':
        raise HTTPException(status_code=403, detail="Admin only")
    
    # Get all completed transactions
    transactions = await db.payment_transactions.find({
        "payment_status": "completed"
    }).to_list(10000)
    
    # Calculate revenue streams
    commission_revenue = sum(t.get('platform_commission', 0) for t in transactions)
    emergency_fee_revenue = sum(t.get('emergency_fee', 0) for t in transactions)
    diagnostics_revenue = sum(t.get('diagnostics_fee', 0) for t in transactions)
    
    # Subscription revenue
    subscriptions = await db.subscriptions.find({"status": "active"}).to_list(1000)
    monthly_recurring_revenue = sum(s.get('price', 0) for s in subscriptions)
    
    # Technician verification revenue
    verifications = await db.technician_verifications.find({
        "verification_fee_paid": True
    }).to_list(1000)
    verification_revenue = sum(v.get('verification_fee_amount', 0) for v in verifications)
    
    # Calculate by urgency level
    low_urgency = [t for t in transactions if t.get('platform_commission_rate', 0) <= 0.10]
    medium_urgency = [t for t in transactions if 0.10 < t.get('platform_commission_rate', 0) <= 0.15]
    high_urgency = [t for t in transactions if t.get('platform_commission_rate', 0) > 0.15]
    
    return {
        "total_revenue": commission_revenue + emergency_fee_revenue + diagnostics_revenue + verification_revenue,
        "breakdown": {
            "commission_revenue": commission_revenue,
            "emergency_fees": emergency_fee_revenue,
            "diagnostics_fees": diagnostics_revenue,
            "verification_fees": verification_revenue,
            "subscription_mrr": monthly_recurring_revenue
        },
        "transaction_counts": {
            "total": len(transactions),
            "low_urgency": len(low_urgency),
            "medium_urgency": len(medium_urgency),
            "high_urgency": len(high_urgency)
        },
        "active_subscriptions": len(subscriptions),
        "verified_technicians": len(verifications),
        "projected_annual_recurring": monthly_recurring_revenue * 12
    }

# ===== Admin Endpoints =====

@api_router.get("/admin/stats")
async def get_admin_stats(
    request: Request,
    authorization: Optional[str] = Header(None)
):
    """Get platform statistics (admin only)"""
    session_token = request.cookies.get("session_token")
    user = await get_current_user(authorization, session_token)
    
    if not user or user.role != 'admin':
        raise HTTPException(status_code=403, detail="Admin only")
    
    total_jobs = await db.jobs.count_documents({})
    total_users = await db.users.count_documents({})
    total_warehouses = await db.users.count_documents({"role": "warehouse"})
    total_techs = await db.users.count_documents({"role": "technician"})
    verified_techs = await db.users.count_documents({"role": "technician", "verified": True})
    
    transactions = await db.payment_transactions.find({"payment_status": "completed"}, {"_id": 0}).to_list(1000)
    total_revenue = sum(t['platform_commission'] for t in transactions)
    total_volume = sum(t['amount'] for t in transactions)
    
    return {
        "total_jobs": total_jobs,
        "total_users": total_users,
        "total_warehouses": total_warehouses,
        "total_technicians": total_techs,
        "verified_technicians": verified_techs,
        "total_platform_revenue": total_revenue,
        "total_transaction_volume": total_volume
    }

@api_router.post("/admin/verify-tech/{tech_id}")
async def verify_technician(
    tech_id: str,
    request: Request,
    authorization: Optional[str] = Header(None)
):
    """Verify a technician (admin only)"""
    session_token = request.cookies.get("session_token")
    user = await get_current_user(authorization, session_token)
    
    if not user or user.role != 'admin':
        raise HTTPException(status_code=403, detail="Admin only")
    
    await db.users.update_one(
        {"id": tech_id, "role": "technician"},
        {"$set": {"verified": True}}
    )
    
    return {"message": "Technician verified"}

@api_router.get("/technicians")
async def get_technicians(
    verified_only: bool = False
):
    """Get all technicians"""
    query = {"role": "technician"}
    if verified_only:
        query["verified"] = True
    
    techs = await db.users.find(query, {"_id": 0}).to_list(1000)
    
    for tech in techs:
        if isinstance(tech.get('created_at'), str):
            tech['created_at'] = datetime.fromisoformat(tech['created_at'])
    
    return techs

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security headers middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
