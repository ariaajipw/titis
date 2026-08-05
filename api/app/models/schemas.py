from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel

ItemType = Literal["text", "voice", "image", "youtube"]


class CreateItemRequest(BaseModel):
    type: ItemType = "text"
    content: str
    source_url: Optional[str] = None


class InboxItem(BaseModel):
    id: str
    user_id: str
    type: ItemType
    content: str
    source_url: Optional[str] = None
    status: str
    created_at: datetime


class HealthResponse(BaseModel):
    status: str
    version: str
