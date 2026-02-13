from core.database import Base
from sqlalchemy import Column, DateTime, Integer, String


class User_credits(Base):
    __tablename__ = "user_credits"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    user_id = Column(String, nullable=False)
    free_credits = Column(Integer, nullable=True)
    paid_credits = Column(Integer, nullable=True)
    share_credits_earned = Column(Integer, nullable=True)
    subscription_type = Column(String, nullable=True)
    subscription_expires_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), nullable=True)