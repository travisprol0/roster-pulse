def test_health_endpoint_returns_ok(client):
    response = client.get("/api/health/")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    assert response["Access-Control-Allow-Origin"] == "*"
    assert "DELETE" in response["Access-Control-Allow-Methods"]


def test_expo_web_preflight_for_espn_credentials_includes_cors(client):
    response = client.options(
        "/api/espn-credentials/",
        HTTP_ORIGIN="http://localhost:8081",
        HTTP_ACCESS_CONTROL_REQUEST_METHOD="POST",
        HTTP_ACCESS_CONTROL_REQUEST_HEADERS="content-type",
    )
    assert response.status_code == 200
    assert response["Access-Control-Allow-Origin"] == "*"
    assert "POST" in response["Access-Control-Allow-Methods"]
    assert "content-type" in response["Access-Control-Allow-Headers"].lower()


def test_espn_credentials_error_response_includes_cors(client):
    response = client.post(
        "/api/espn-credentials/",
        data="not-json",
        content_type="application/json",
        HTTP_ORIGIN="http://localhost:8081",
    )
    assert response["Access-Control-Allow-Origin"] == "*"
    assert "POST" in response["Access-Control-Allow-Methods"]
