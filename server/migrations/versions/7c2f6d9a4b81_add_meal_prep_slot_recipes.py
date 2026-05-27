"""add meal prep slot recipes

Revision ID: 7c2f6d9a4b81
Revises: d4ca1211fc11
Create Date: 2026-05-27 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '7c2f6d9a4b81'
down_revision = 'd4ca1211fc11'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'meal_prep_slot_recipes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('meal_prep_slot_id', sa.Integer(), nullable=False),
        sa.Column('recipe_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['meal_prep_slot_id'], ['meal_prep_slots.id'], ),
        sa.ForeignKeyConstraint(['recipe_id'], ['recipes.id'], ),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade():
    op.drop_table('meal_prep_slot_recipes')
