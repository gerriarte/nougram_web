"""add_target_margin_percentage_to_quotes

Revision ID: 3b000e90aba6
Revises: bfc774065893
Create Date: 2025-12-30 18:06:48.789912

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '3b000e90aba6'
down_revision: Union[str, None] = 'bfc774065893'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add target_margin_percentage column to quotes table
    op.add_column('quotes', sa.Column('target_margin_percentage', sa.Float(), nullable=True))


def downgrade() -> None:
    # Remove target_margin_percentage column from quotes table
    op.drop_column('quotes', 'target_margin_percentage')

