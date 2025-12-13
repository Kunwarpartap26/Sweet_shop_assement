from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_user_can_register():
    response = client.post("/api/auth/register", json={
        "email": "register_test@example.com",
        "password": "password123"
    })
    assert response.status_code in(201,400) 

def test_user_can_login():
    response = client.post("/api/auth/login", json={
        "email": "register_test@example.com",
        "password": "password123"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()
def test_protected_route_requires_auth():
    response = client.get("/api/protected/profile")
    assert response.status_code == 401

def test_protected_route_with_token():
    login_response = client.post("/api/auth/login", json={
        "email": "register_test@example.com",
        "password": "password123"
    })

    token = login_response.json()["access_token"]

    response = client.get(
        "/api/protected/profile",
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 200
    assert response.json()["email"] == "register_test@example.com"
