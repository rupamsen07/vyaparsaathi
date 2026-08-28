import json
from pathlib import Path


SCHEMES_FILE = Path(__file__).resolve().parents[1] / "data" / "mosje_schemes.json"


def get_best_matching_scheme(project_cost: float, target_group: str = "General") -> dict:
    with SCHEMES_FILE.open("r", encoding="utf-8") as schemes_file:
        schemes = json.load(schemes_file)

    eligible = [scheme for scheme in schemes if scheme["max_cost"] >= project_cost]
    if not eligible:
        selected = schemes[0]
    else:
        target = target_group.lower()
        specialized = [
            scheme for scheme in eligible
            if scheme["target_group"].lower() != "general / all micro-entrepreneurs"
            and any(keyword in scheme["target_group"].lower() for keyword in target.split())
        ]
        selected = specialized[0] if specialized else eligible[0]

    margin_amount = (project_cost * selected["promoter_margin_pct"]) / 100.0
    loan_amount = project_cost - margin_amount
    repayment_months = selected["repayment_period_months"]
    monthly_rate = (selected["interest_rate_pa"] / 100.0) / 12.0

    if monthly_rate > 0 and repayment_months > 0:
        emi = (loan_amount * monthly_rate * ((1 + monthly_rate) ** repayment_months)) / (((1 + monthly_rate) ** repayment_months) - 1)
    elif repayment_months > 0:
        emi = loan_amount / repayment_months
    else:
        emi = 0.0

    return {
        "scheme_id": selected["scheme_id"],
        "scheme_name": selected["scheme_name"],
        "beneficiary_margin": round(margin_amount, 2),
        "loan_amount": round(loan_amount, 2),
        "monthly_emi": round(emi, 2),
        "interest_rate": selected["interest_rate_pa"],
        "required_docs": selected["documents_required"],
        "moratorium_months": selected["moratorium_months"],
        "repayment_months": repayment_months,
        "target_group": selected["target_group"],
    }


def calculate_mosje_micro_finance(total_project_cost: float, target_group: str = "General") -> dict:
    scheme = get_best_matching_scheme(total_project_cost, target_group)
    return {
        "total_project_cost": total_project_cost,
        "beneficiary_margin": scheme["beneficiary_margin"],
        "loan_amount": scheme["loan_amount"],
        "annual_interest_rate": f'{scheme["interest_rate"]}%',
        "moratorium_months": scheme["moratorium_months"],
        "repayment_months": scheme["repayment_months"],
        "monthly_emi": scheme["monthly_emi"],
        "scheme_name": scheme["scheme_name"],
        "scheme_id": scheme["scheme_id"],
        "required_docs": scheme["required_docs"],
        "target_group": scheme["target_group"],
    }