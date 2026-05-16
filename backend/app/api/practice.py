from datetime import date, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.deps import get_db, get_current_user
from app.models.user import User
from app.models.practice import PracticeSession
from app.schemas.practice import SessionCreate, SessionResponse, StatsResponse, DailyStats

router = APIRouter(prefix="/practice", tags=["practice"])


@router.post("/sessions", response_model=SessionResponse, status_code=201)
async def create_session(
    body: SessionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = PracticeSession(
        user_id=current_user.id,
        mode=body.mode,
        lang=body.lang,
        cpm=body.cpm,
        accuracy=body.accuracy,
        duration=body.duration,
        sentences=body.sentences,
        error_log=body.error_log,
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session


@router.get("/sessions", response_model=list[SessionResponse])
async def list_sessions(
    limit: int = Query(default=20, le=100),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(PracticeSession)
        .where(PracticeSession.user_id == current_user.id)
        .order_by(PracticeSession.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    return result.scalars().all()


@router.get("/stats", response_model=StatsResponse)
async def get_stats(
    days: int = Query(default=30, le=365),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    since = date.today() - timedelta(days=days - 1)

    # 일별 집계
    daily_rows = await db.execute(
        select(
            func.date(PracticeSession.created_at).label("day"),
            func.avg(PracticeSession.cpm).label("avg_cpm"),
            func.avg(PracticeSession.accuracy).label("avg_accuracy"),
            func.count(PracticeSession.id).label("cnt"),
        )
        .where(
            PracticeSession.user_id == current_user.id,
            func.date(PracticeSession.created_at) >= since,
        )
        .group_by("day")
        .order_by("day")
    )

    daily = [
        DailyStats(
            date=str(row.day),
            avg_cpm=round(row.avg_cpm, 1),
            avg_accuracy=round(row.avg_accuracy, 1),
            session_count=row.cnt,
        )
        for row in daily_rows
    ]

    # 전체 베스트 CPM / 총 세션 수
    agg = await db.execute(
        select(
            func.max(PracticeSession.cpm).label("best"),
            func.count(PracticeSession.id).label("total"),
        ).where(PracticeSession.user_id == current_user.id)
    )
    row = agg.one()

    return StatsResponse(
        daily=daily,
        best_cpm=row.best or 0,
        total_sessions=row.total,
    )
