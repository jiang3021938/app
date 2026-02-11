from core.database import Base
from sqlalchemy import Column, DateTime, Float, Integer, String


class Extractions(Base):
    __tablename__ = "extractions"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    user_id = Column(String, nullable=False)
    document_id = Column(Integer, nullable=False)
    tenant_name = Column(String, nullable=True)
    landlord_name = Column(String, nullable=True)
    property_address = Column(String, nullable=True)
    monthly_rent = Column(Float, nullable=True)
    security_deposit = Column(Float, nullable=True)
    lease_start_date = Column(String, nullable=True)
    lease_end_date = Column(String, nullable=True)
    renewal_notice_days = Column(Integer, nullable=True)
    pet_policy = Column(String, nullable=True)
    late_fee_terms = Column(String, nullable=True)
    risk_flags = Column(String, nullable=True)
    compliance_data = Column(String, nullable=True)
    raw_extraction = Column(String, nullable=True)
    source_map = Column(String, nullable=True)     # JSON: field → PDF source locations
    pages_meta = Column(String, nullable=True)      # JSON: PDF page dimensions
    created_at = Column(DateTime(timezone=True), nullable=True)