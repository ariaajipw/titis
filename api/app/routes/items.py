from typing import Annotated

from fastapi import APIRouter, Header

from app.core.errors import NotFoundError, UnauthorizedError
from app.models.schemas import CreateItemRequest, InboxItem
from app.services.supabase import get_supabase

router = APIRouter(prefix="/items", tags=["items"])


def get_user_id(authorization: str) -> str:
    if not authorization.startswith("Bearer "):
        raise UnauthorizedError()
    token = authorization.removeprefix("Bearer ")
    try:
        user = get_supabase().auth.get_user(token)
    except Exception:
        raise UnauthorizedError() from None
    return user.user.id


@router.post("", status_code=201)
async def create_item(
    body: CreateItemRequest,
    authorization: Annotated[str, Header()],
) -> InboxItem:
    user_id = get_user_id(authorization)
    result = (
        get_supabase()
        .table("inbox_items")
        .insert(
            {
                "user_id": user_id,
                "type": body.type,
                "content": body.content,
                "source_url": body.source_url,
            }
        )
        .execute()
    )
    return InboxItem(**result.data[0])


@router.get("")
async def list_items(
    authorization: Annotated[str, Header()],
) -> list[InboxItem]:
    user_id = get_user_id(authorization)
    result = (
        get_supabase()
        .table("inbox_items")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return [InboxItem(**row) for row in result.data]


@router.delete("/{item_id}", status_code=204)
async def delete_item(
    item_id: str,
    authorization: Annotated[str, Header()],
) -> None:
    user_id = get_user_id(authorization)
    result = (
        get_supabase()
        .table("inbox_items")
        .delete()
        .eq("id", item_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not result.data:
        raise NotFoundError("Item")
