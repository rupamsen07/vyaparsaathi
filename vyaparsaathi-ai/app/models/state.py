from pydantic import BaseModel
from typing import List, Optional

class UserProfile(BaseModel):
    language: Optional[str] = None
    district: Optional[str] = None
    available_capital: Optional[float] = None
    skills: Optional[List[str]] = None
    assets: Optional[List[str]] = None

class BusinessContext(BaseModel):
    mode: Optional[str] = None
    category: Optional[str] = None
    business_name: Optional[str] = None
    candidate_zones: Optional[List[str]] = None
    competitor_count: Optional[int] = None
    supply_distance_km: Optional[float] = None
    daily_input_cost: Optional[float] = None
    additional_details: Optional[dict] = {}

class FinancialEvaluation(BaseModel):
    total_project_cost: Optional[float] = None
    margin_money_10pct: Optional[float] = None
    loan_required_90pct: Optional[float] = None
    scheme_matched: Optional[str] = None
    estimated_monthly_emi: Optional[float] = None
    break_even_days: Optional[int] = None

class VyaparState(BaseModel):
    user_profile: Optional[UserProfile] = None
    business_context: Optional[BusinessContext] = None
    financial_evaluation: Optional[FinancialEvaluation] = None