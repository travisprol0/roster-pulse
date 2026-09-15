from django.contrib import admin
from django.urls import path

from config.views import (
    espn_credentials,
    evaluate,
    health,
    league,
    league_refresh,
    leagues,
    lineup_set,
    trade_propose,
    trades,
    waiver_claim,
    waivers,
)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", health),
    path("api/trades/propose/", trade_propose),
    path("api/trades/", trades),
    path("api/evaluate/", evaluate),
    path("api/espn-credentials/", espn_credentials),
    path("api/leagues/", leagues),
    path("api/league/refresh/", league_refresh),
    path("api/league/", league),
    path("api/lineup/", lineup_set),
    path("api/waivers/claim/", waiver_claim),
    path("api/waivers/", waivers),
]
