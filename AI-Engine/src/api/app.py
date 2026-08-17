import os
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from src.api.routes import (
    health_router,
    prediction_router,
    batch_router,
    inventory_router,
    chat_router,
)
from src.batch.exceptions import (
    BatchNotFoundError,
    InvalidBatchError,
    InvalidQuantityError,
    BatchException,
)
from src.data.paths import load_config


def create_app() -> FastAPI:
    """
    FastAPI Application Factory for Dravya AI Engine.
    Exposes production inference endpoints, configures OpenAPI metadata,
    and installs leak-proof error handling middleware.
    """
    config = load_config()
    api_cfg = config.get("api", {})

    title = api_cfg.get(
        "title", "Dravya AI Engine - Medicinal Plant Inference API"
    )
    description = api_cfg.get(
        "description",
        "Production-grade plant classification inference API powered by Dravya AI Engine",
    )
    version = api_cfg.get("version", "0.1.0")

    app = FastAPI(
        title=title,
        description=description,
        version=version,
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # Configure CORS
    default_origins = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]
    configured_origins = list(api_cfg.get("cors_allowed_origins", default_origins))

    # Collect additional origins from environment variables
    env_frontend = os.getenv("DRAVYA_FRONTEND_ORIGIN")
    env_cors = os.getenv("DRAVYA_CORS_ORIGINS") or os.getenv("CORS_ALLOWED_ORIGINS")

    additional_origins = []
    if env_frontend:
        additional_origins.extend([o.strip().rstrip("/") for o in env_frontend.split(",") if o.strip()])
    if env_cors:
        additional_origins.extend([o.strip().rstrip("/") for o in env_cors.split(",") if o.strip()])

    for origin in additional_origins:
        if origin not in configured_origins:
            configured_origins.append(origin)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=configured_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["*"],
    )



    # Include routes
    app.include_router(health_router)
    app.include_router(prediction_router)
    app.include_router(batch_router)
    app.include_router(inventory_router)
    app.include_router(chat_router)


    @app.get("/", include_in_schema=False)
    async def root():
        from fastapi.responses import RedirectResponse
        return RedirectResponse(url="/docs")

    @app.get("/report", include_in_schema=False)
    async def get_report():
        from pathlib import Path
        from fastapi.responses import HTMLResponse
        report_path = Path(__file__).resolve().parent.parent.parent / "reports" / "dravya_ai_engine_full_report.html"
        if report_path.exists():
            with open(report_path, "r", encoding="utf-8") as f:
                content = f.read()
            return HTMLResponse(content=content)
        return HTMLResponse(content="<h1>Report file not found</h1>", status_code=404)

    # Custom Batch Exception Handlers
    @app.exception_handler(BatchNotFoundError)
    async def batch_not_found_handler(request: Request, exc: BatchNotFoundError):
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "Not Found", "detail": str(exc)},
        )

    @app.exception_handler(InvalidQuantityError)
    @app.exception_handler(InvalidBatchError)
    async def invalid_batch_handler(request: Request, exc: BatchException):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"error": "Bad Request", "detail": str(exc)},
        )

    # Clean Exception Handlers
    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": exc.detail if isinstance(exc.detail, str) else "HTTP Exception",
                "detail": exc.detail,
            },
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": "Internal Server Error",
                "detail": "An unexpected error occurred during request processing.",
            },
        )

    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "8000"))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("src.api.app:app", host=host, port=port, reload=False)
