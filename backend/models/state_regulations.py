from core.database import Base
from sqlalchemy import Column, Float, Integer, String


class State_regulations(Base):
    __tablename__ = "state_regulations"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    state_code = Column(String, nullable=False)
    state_name = Column(String, nullable=False)
    regulation_category = Column(String, nullable=False)
    regulation_title = Column(String, nullable=False)
    regulation_content = Column(String, nullable=False)
    max_amount = Column(Float, nullable=True)
    max_multiplier = Column(Float, nullable=True)
    required_days = Column(Integer, nullable=True)
    source_url = Column(String, nullable=True)
    last_updated = Column(String, nullable=True)