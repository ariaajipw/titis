from fastapi import HTTPException, status


class TitisError(HTTPException):
    def __init__(self, status_code: int, code: str, message: str) -> None:
        super().__init__(status_code=status_code, detail=message)
        self.status_code = status_code
        self.code = code
        self.message = message


class UnauthorizedError(TitisError):
    def __init__(self) -> None:
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            code="UNAUTHORIZED",
            message="Token tidak valid atau sudah expired",
        )


class NotFoundError(TitisError):
    def __init__(self, resource: str) -> None:
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            code="NOT_FOUND",
            message=f"{resource} tidak ditemukan",
        )
