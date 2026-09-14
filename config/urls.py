from django.contrib import admin
from django.urls import path

from config.views import health, trades

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", health),
    path("api/trades/", trades),
]
