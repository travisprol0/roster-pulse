from django.contrib import admin
from django.urls import path

from config.views import (
    espn_credentials,
    evaluate,
    health,
    league,
    league_refresh,
    leagues,
    trades,
)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", health),
    path("api/trades/", trades),
    path("api/evaluate/", evaluate),
    path("api/espn-credentials/", espn_credentials),
    path("api/leagues/", leagues),
    path("api/league/refresh/", league_refresh),
    path("api/league/", league),
]
