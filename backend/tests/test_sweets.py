from fastapi.testclient import TestClient
from app.main import app
from app.models.user import User

client = TestClient(app)

def test_create_sweet():
    response = client.post(
        "/api/sweets",
        json={
            "name": "Kaju Katli",
            "category": "Dry Fruit",
            "price": 500,
            "quantity": 20
        }
    )

    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Kaju Katli"
    assert data["price"] == 500
def test_get_sweets():
    response = client.get("/api/sweets")

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
def test_search_sweets_by_name():
    response = client.get("/api/sweets/search?query=Kaju")

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert "Kaju" in data[0]["name"]
def test_update_sweet():
    # First, create a sweet
    create_response = client.post(
        "/api/sweets",
        json={
            "name": "Ladoo",
            "category": "Traditional",
            "price": 200,
            "quantity": 50
        }
    )

    sweet_id = create_response.json()["id"]

    # Update the sweet
    update_response = client.put(
        f"/api/sweets/{sweet_id}",
        json={
            "name": "Besan Ladoo",
            "category": "Traditional",
            "price": 250,
            "quantity": 40
        }
    )

    assert update_response.status_code == 200
    data = update_response.json()
    assert data["name"] == "Besan Ladoo"
    assert data["price"] == 250
def test_non_admin_cannot_delete_sweet():
    # Register normal user
    client.post("/api/auth/register", json={
        "email": "user1@example.com",
        "password": "password123"
    })

    login = client.post("/api/auth/login", json={
        "email": "user1@example.com",
        "password": "password123"
    })
    token = login.json()["access_token"]

    # Create sweet
    sweet = client.post("/api/sweets", json={
        "name": "Jalebi",
        "category": "Traditional",
        "price": 150,
        "quantity": 30
    }).json()

    response = client.delete(
        f"/api/sweets/{sweet['id']}",
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 403


def test_admin_can_delete_sweet():
    # Register admin user
    client.post("/api/auth/register", json={
        "email": "admin@example.com",
        "password": "adminpass"
    })

    # Manually promote to admin (test shortcut)
    from app.database import SessionLocal
    

    db = SessionLocal()
    admin = db.query(User).filter(User.email == "admin@example.com").first()
    admin.is_admin = True
    db.commit()
    db.close()

    login = client.post("/api/auth/login", json={
        "email": "admin@example.com",
        "password": "adminpass"
    })
    token = login.json()["access_token"]

    # Create sweet
    sweet = client.post("/api/sweets", json={
        "name": "Barfi",
        "category": "Milk",
        "price": 300,
        "quantity": 10
    }).json()

    response = client.delete(
        f"/api/sweets/{sweet['id']}",
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 200
