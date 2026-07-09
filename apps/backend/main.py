from fastapi import FastAPI

app = FastAPI(title="AI Anime Dating Simulator API")

@app.get("/")
def read_root():
    return {"message": "Welcome to the AI Anime Dating Simulator Engine"}
