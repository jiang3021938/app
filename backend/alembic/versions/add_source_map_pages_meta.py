"""add source_map and pages_meta columns

Revision ID: a1b2c3d4e5f6
Revises: 35cbfcc5322e
Create Date: 2026-02-09 00:10:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '35cbfcc5322e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add source_map column for storing field to PDF source location mapping
    op.add_column('extractions', sa.Column('source_map', sa.String(), nullable=True))
    # Add pages_meta column for storing PDF page dimensions
    op.add_column('extractions', sa.Column('pages_meta', sa.String(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('extractions', 'pages_meta')
    op.drop_column('extractions', 'source_map')