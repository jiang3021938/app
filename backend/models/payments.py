from core.database import Base
from sqlalchemy import Column, DateTime, Float, Integer, String


class Payments(Base):
    __tablename__ = "payments"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    user_id = Column(String, nullable=False)
    stripe_session_id = Column(String, nullable=True)
    amount = Column(Float, nullable=False)
    currency = Column(String, nullable=True)
    payment_type = Column(String, nullable=True)
    credits_purchased = Column(Integer, nullable=True)
    status = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=True)