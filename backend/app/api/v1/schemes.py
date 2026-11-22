import json

from fastapi import APIRouter, HTTPException, Query

from app.api.v1.auth import success
from app.db.store import many, one

router = APIRouter(prefix="/schemes", tags=["schemes"])


@router.get("")
async def list_schemes(
    search: str = "",
    category: str = "",
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
) -> dict:
    rows = many("SELECT * FROM schemes WHERE status='active' ORDER BY name")
    if search:
        needle = search.lower()
        rows = [row for row in rows if needle in row["name"].lower() or needle in row["description"].lower()]
    if category:
        rows = [row for row in rows if row["category"].lower() == category.lower()]
    total = len(rows)
    start = (page - 1) * limit
    data = []
    for row in rows[start:start + limit]:
        item = dict(row)
        item["requiredDocuments"] = json.loads(item["required_documents"]) if item["required_documents"] else []
        data.append(item)
    return success(data, "Schemes retrieved")


@router.get("/categories")
async def scheme_categories() -> dict:
    rows = many("SELECT DISTINCT category FROM schemes WHERE status='active' ORDER BY category")
    return success([row["category"] for row in rows], "Scheme categories retrieved")


@router.get("/featured")
async def featured_schemes() -> dict:
    rows = many("SELECT * FROM schemes WHERE status='active' LIMIT 3")
    return success(rows, "Featured demo schemes retrieved")


@router.get("/{scheme_id}")
async def scheme_detail(scheme_id: str) -> dict:
    scheme = one("SELECT * FROM schemes WHERE id=?", (scheme_id,))
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")
    scheme = dict(scheme)
    scheme["requiredDocuments"] = json.loads(scheme["required_documents"]) if scheme["required_documents"] else []
    return success(scheme, "Scheme retrieved")


@router.get("/{scheme_id}/policy")
async def scheme_policy(scheme_id: str) -> dict:
    scheme = one("SELECT id,name,policy_version,official_url,last_updated,is_demo FROM schemes WHERE id=?", (scheme_id,))
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")
    return success(scheme, "Policy reference retrieved")


@router.get("/{scheme_id}/eligibility-rules")
async def eligibility_rules(scheme_id: str) -> dict:
    scheme = one("SELECT id,name,eligibility_summary,policy_version,is_demo FROM schemes WHERE id=?", (scheme_id,))
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")
    return success({
        "schemeId": scheme["id"],
        "policyVersion": scheme["policy_version"],
        "rules": [
            {"ruleId": "location", "type": "location", "required": True},
            {"ruleId": "landholding", "type": "land_area", "required": True},
            {"ruleId": "cultivator", "type": "cultivator_type", "required": True},
        ],
        "isDemo": True,
    }, "Eligibility rule summary retrieved")
