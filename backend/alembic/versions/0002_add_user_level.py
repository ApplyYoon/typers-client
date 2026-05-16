"""add user level and initial_cpm

Revision ID: 0002
Revises: 0001
Create Date: 2026-05-16
"""
from alembic import op
import sqlalchemy as sa

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("level", sa.Integer(), nullable=False, server_default="0"))
    op.add_column("users", sa.Column("initial_cpm", sa.Integer(), nullable=False, server_default="0"))


def downgrade() -> None:
    op.drop_column("users", "initial_cpm")
    op.drop_column("users", "level")
