from datetime import datetime, timezone
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.deps import get_db, get_current_user
from app.models.user import User
from app.models.dictionary import Dictionary
from app.schemas.dictionary import DictionaryCreate, DictionaryUpdate, DictionaryResponse

router = APIRouter(prefix="/dictionaries", tags=["dictionaries"])


@router.get("", response_model=list[DictionaryResponse])
async def list_dictionaries(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Dictionary)
        .where(Dictionary.user_id == current_user.id)
        .order_by(Dictionary.updated_at.desc())
    )
    return result.scalars().all()


@router.post("", response_model=DictionaryResponse, status_code=status.HTTP_201_CREATED)
async def create_dictionary(
    body: DictionaryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # 빈 단어 제거 + 중복 제거
    words = list(dict.fromkeys(w.strip() for w in body.words if w.strip()))
    d = Dictionary(user_id=current_user.id, name=body.name, words=words)
    db.add(d)
    await db.commit()
    await db.refresh(d)
    return d


@router.get("/{dict_id}", response_model=DictionaryResponse)
async def get_dictionary(
    dict_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    d = await _get_or_404(db, dict_id, current_user.id)
    return d


@router.patch("/{dict_id}", response_model=DictionaryResponse)
async def update_dictionary(
    dict_id: uuid.UUID,
    body: DictionaryUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    d = await _get_or_404(db, dict_id, current_user.id)
    if body.name is not None:
        d.name = body.name
    if body.words is not None:
        d.words = list(dict.fromkeys(w.strip() for w in body.words if w.strip()))
    d.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(d)
    return d


@router.delete("/{dict_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_dictionary(
    dict_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    d = await _get_or_404(db, dict_id, current_user.id)
    await db.delete(d)
    await db.commit()


async def _get_or_404(db: AsyncSession, dict_id: uuid.UUID, user_id: uuid.UUID) -> Dictionary:
    result = await db.execute(
        select(Dictionary).where(Dictionary.id == dict_id, Dictionary.user_id == user_id)
    )
    d = result.scalar_one_or_none()
    if d is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="사전을 찾을 수 없습니다")
    return d
