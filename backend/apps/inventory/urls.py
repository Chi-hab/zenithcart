from rest_framework.routers import DefaultRouter

from .views import (
    InventoryRecordViewSet,
    StockMovementViewSet,
    WarehouseViewSet,
)

router = DefaultRouter()
router.register("warehouses", WarehouseViewSet, basename="warehouse")
router.register("inventory", InventoryRecordViewSet, basename="inventory")
router.register("stock-movements", StockMovementViewSet, basename="stock-movement")

urlpatterns = router.urls
