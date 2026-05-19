"""add battle_matches table and rank_score to users

Revision ID: 0004
Revises: 0003
Create Date: 2026-05-19
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0004"
down_revision = "0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # users 테이블에 rank_score 컬럼 추가 (기본값 1000 — 배치 전 중간 등급)
    op.add_column(
        "users",
        sa.Column("rank_score", sa.Integer(), nullable=False, server_default="1000"),
    )

    # battle_matches 테이블 생성
    op.create_table(
        "battle_matches",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("player_a_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("player_b_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("winner_id",   postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("player_a_cpm",      sa.Integer(), nullable=False, server_default="0"),
        sa.Column("player_b_cpm",      sa.Integer(), nullable=False, server_default="0"),
        sa.Column("player_a_accuracy", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("player_b_accuracy", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("mmr_delta",         sa.Integer(), nullable=False, server_default="0"),
        sa.Column("mode",              sa.String(16), nullable=False, server_default="quick"),
        sa.Column("completed_at",      sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_battle_matches_completed_at", "battle_matches", ["completed_at"])


def downgrade() -> None:
    op.drop_index("ix_battle_matches_completed_at", table_name="battle_matches")
    op.drop_table("battle_matches")
    op.drop_column("users", "rank_score")
