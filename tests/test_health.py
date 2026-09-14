def test_health_endpoint_returns_ok(client):
    response = client.get("/api/health/")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_trades_endpoint_returns_proposed_trades(client):
    response = client.get("/api/trades/")
    assert response.status_code == 200
    body = response.json()
    assert body["trades"][0]["send"] == "Bench RB"
    assert body["trades"][0]["teamADelta"] == 4.2
    assert body["trades"][0]["teamBDelta"] == 3.1
