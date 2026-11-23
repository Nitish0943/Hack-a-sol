import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models.application import Application
from app.models.farmer import Farmer
from app.models.scheme import Scheme
from app.schemas.application import ApplicationCreate, ApplicationResponse, ApplicationStatusUpdate

router = APIRouter(prefix="/applications", tags=["applications"])


@router.get("", response_model=list[ApplicationResponse])
async def list_applications(status: str | None = None, db: AsyncSession = Depends(get_db)) -> list[ApplicationResponse]:
    query = select(Application, Scheme.name).join(Scheme, Application.scheme_id == Scheme.id)
    if status and status.lower() != "all":
        query = query.where(Application.status.ilike(f"%{status}%"))

    result = await db.execute(query)
    rows = result.all()

    output = []
    for app, scheme_name in rows:
        output.append(
            ApplicationResponse(
                id=app.id,
                farmer_id=app.farmer_id,
                scheme_id=app.scheme_id,
                scheme_name=scheme_name,
                reference_number=app.reference_number,
                submission_date=app.submission_date,
                status=app.status,
                channel=app.channel,
                rejection_reason=app.rejection_reason,
                pending_action=app.pending_action,
                timeline_json=app.timeline_json,
                remarks=app.remarks,
            )
        )
    return output


@router.post("", response_model=ApplicationResponse)
async def create_application(data: ApplicationCreate, db: AsyncSession = Depends(get_db)) -> ApplicationResponse:
    farmer_res = await db.execute(select(Farmer))
    farmer = farmer_res.scalars().first()
    if not farmer:
        raise HTTPException(status_code=400, detail="No registered farmer profile found")

    new_id = f"app-{int(datetime.now().timestamp())}"
    timeline = json.dumps([
        {"date": datetime.now().strftime("%d %b %Y"), "title": "Application Created", "detail": "Farmer recorded reference in KrishiSetu."}
    ])

    app = Application(
        id=new_id,
        farmer_id=farmer.id,
        scheme_id=data.scheme_id,
        reference_number=data.reference_number,
        submission_date=data.submission_date or datetime.now().strftime("%d %b %Y"),
        status="Under review",
        channel=data.channel,
        remarks=data.remarks,
        timeline_json=timeline,
    )
    db.add(app)
    await db.commit()
    await db.refresh(app)

    scheme_res = await db.execute(select(Scheme).where(Scheme.id == app.scheme_id))
    scheme = scheme_res.scalars().first()

    return ApplicationResponse(
        id=app.id,
        farmer_id=app.farmer_id,
        scheme_id=app.scheme_id,
        scheme_name=scheme.name if scheme else "",
        reference_number=app.reference_number,
        submission_date=app.submission_date,
        status=app.status,
        channel=app.channel,
        rejection_reason=app.rejection_reason,
        pending_action=app.pending_action,
        timeline_json=app.timeline_json,
        remarks=app.remarks,
    )


@router.get("/{application_id}", response_model=ApplicationResponse)
async def get_application(application_id: str, db: AsyncSession = Depends(get_db)) -> ApplicationResponse:
    result = await db.execute(
        select(Application, Scheme.name)
        .join(Scheme, Application.scheme_id == Scheme.id)
        .where(Application.id == application_id)
    )
    row = result.first()
    if not row:
        raise HTTPException(status_code=404, detail="Application not found")

    app, scheme_name = row
    return ApplicationResponse(
        id=app.id,
        farmer_id=app.farmer_id,
        scheme_id=app.scheme_id,
        scheme_name=scheme_name,
        reference_number=app.reference_number,
        submission_date=app.submission_date,
        status=app.status,
        channel=app.channel,
        rejection_reason=app.rejection_reason,
        pending_action=app.pending_action,
        timeline_json=app.timeline_json,
        remarks=app.remarks,
    )


@router.put("/{application_id}", response_model=ApplicationResponse)
async def update_application_status(
    application_id: str,
    update: ApplicationStatusUpdate,
    db: AsyncSession = Depends(get_db),
) -> ApplicationResponse:
    result = await db.execute(select(Application).where(Application.id == application_id))
    app = result.scalars().first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    app.status = update.status
    if update.remarks:
        app.remarks = update.remarks
    if update.pending_action is not None:
        app.pending_action = update.pending_action

    # Update timeline
    try:
        tl = json.loads(app.timeline_json)
    except Exception:
        tl = []
    tl.append({
        "date": datetime.now().strftime("%d %b %Y"),
        "title": f"Status updated to {update.status}",
        "detail": update.remarks or "Officer reviewed application record.",
    })
    app.timeline_json = json.dumps(tl)

    await db.commit()
    await db.refresh(app)

    scheme_res = await db.execute(select(Scheme).where(Scheme.id == app.scheme_id))
    scheme = scheme_res.scalars().first()

    return ApplicationResponse(
        id=app.id,
        farmer_id=app.farmer_id,
        scheme_id=app.scheme_id,
        scheme_name=scheme.name if scheme else "",
        reference_number=app.reference_number,
        submission_date=app.submission_date,
        status=app.status,
        channel=app.channel,
        rejection_reason=app.rejection_reason,
        pending_action=app.pending_action,
        timeline_json=app.timeline_json,
        remarks=app.remarks,
    )
