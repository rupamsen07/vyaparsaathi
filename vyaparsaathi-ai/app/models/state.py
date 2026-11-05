from pydantic import BaseModel, Field
from typing import List, Optional

class UserProfile(BaseModel):
    language: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    working_hours: Optional[str] = None
    loan_needed: Optional[bool] = None
    available_capital: Optional[float] = None
    skills: List[str] = Field(default_factory=list)
    assets: List[str] = Field(default_factory=list)

class BusinessContext(BaseModel):
    mode: Optional[str] = None
    category: Optional[str] = None
    business_name: Optional[str] = None
    candidate_zones: Optional[List[str]] = None
    competitor_count: Optional[int] = None
    supply_distance_km: Optional[float] = None
    daily_input_cost: Optional[float] = None
    additional_details: dict = Field(default_factory=dict)

class FinancialEvaluation(BaseModel):
    total_project_cost: Optional[float] = None
    startup_cost: Optional[float] = None
    unit_cost: Optional[float] = None
    selling_price: Optional[float] = None
    fixed_monthly_cost: Optional[float] = None
    expected_daily_units: Optional[float] = None
    funding_gap: Optional[float] = None
    margin_per_unit: Optional[float] = None
    margin_percent: Optional[float] = None
    margin_money_10pct: Optional[float] = None
    loan_required_90pct: Optional[float] = None
    loan_required: Optional[bool] = None
    break_even_units_per_day: Optional[int] = None
    scheme_matched: Optional[str] = None
    estimated_monthly_emi: Optional[float] = None
    estimated_monthly_profit: Optional[float] = None
    break_even_days: Optional[int] = None

class VyaparState(BaseModel):
    user_profile: Optional[UserProfile] = None
    business_context: Optional[BusinessContext] = None
    financial_evaluation: Optional[FinancialEvaluation] = None