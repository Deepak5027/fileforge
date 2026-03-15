import os
import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.routes.convert import router as convert_router

load_dotenv()

app = FastAPI(
    title="FileForge Conversion Engine",
    version="1.0.0",
    description="File conversion microservice powering FileForge",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("NODE_API_URL", "http://localhost:5000"),
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(convert_router, prefix="/convert")


@app.get("/health")
async def health():
    return {"status": "ok", "service": "fileforge-converter"}


@app.on_event("startup")
async def startup():
    os.makedirs("/tmp/fileforge/uploads", exist_ok=True)
    os.makedirs("/tmp/fileforge/outputs", exist_ok=True)
    print("FileForge conversion engine ready")
