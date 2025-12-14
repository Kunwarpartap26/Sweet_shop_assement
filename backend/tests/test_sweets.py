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


def test_purchase_reduces_quantity():
    # Create sweet with quantity 2
    create = client.post("/api/sweets", json={
        "name": "Gulab Jamun",
        "category": "Traditional",
        "price": 50,
        "quantity": 2,
    }).json()

    sweet_id = create["id"]

    # Register and login user
    client.post("/api/auth/register", json={"email": "buyer@example.com", "password": "pwd"})
    login = client.post("/api/auth/login", json={"email": "buyer@example.com", "password": "pwd"}).json()
    token = login["access_token"]

    resp = client.post(f"/api/sweets/{sweet_id}/purchase", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["remaining_quantity"] == 1


def test_purchase_fails_when_quantity_zero():
    # Create sweet with zero quantity
    create = client.post("/api/sweets", json={
        "name": "Empty Sweet",
        "category": "Test",
        "price": 10,
        "quantity": 0,
    }).json()

    sweet_id = create["id"]

    client.post("/api/auth/register", json={"email": "zero@example.com", "password": "pwd"})
    login = client.post("/api/auth/login", json={"email": "zero@example.com", "password": "pwd"}).json()
    token = login["access_token"]

    resp = client.post(f"/api/sweets/{sweet_id}/purchase", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 400
    assert resp.json()["detail"] == "Sweet is out of stock"


def test_restock_increases_quantity_and_non_admin_cannot_restock():
    # Register admin user
    client.post("/api/auth/register", json={"email": "restocker@example.com", "password": "pwd"})
    from app.database import SessionLocal

    db = SessionLocal()
    admin = db.query(User).filter(User.email == "restocker@example.com").first()
    admin.is_admin = True
    db.commit()
    db.close()

    login = client.post("/api/auth/login", json={"email": "restocker@example.com", "password": "pwd"}).json()
    token = login["access_token"]

    # Create sweet with quantity 1
    create = client.post("/api/sweets", json={
        "name": "Restockable",
        "category": "Test",
        "price": 20,
        "quantity": 1,
    }).json()
    sweet_id = create["id"]

    # Admin restocks by 5
    resp = client.post(f"/api/sweets/{sweet_id}/restock?quantity=5", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json()["new_quantity"] == 6

    # Non-admin cannot restock
    client.post("/api/auth/register", json={"email": "notadmin@example.com", "password": "pwd"})
    login2 = client.post("/api/auth/login", json={"email": "notadmin@example.com", "password": "pwd"}).json()
    token2 = login2["access_token"]

    resp2 = client.post(f"/api/sweets/{sweet_id}/restock?quantity=1", headers={"Authorization": f"Bearer {token2}"})
    assert resp2.status_code == 403
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
