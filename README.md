# ZenithCart

A decoupled E-Commerce & Inventory Management Platform.

- **Backend:** Django + Django REST Framework, PostgreSQL, Redis, Celery
- **Frontend:** Next.js (App Router) + TypeScript + Tailwind + Shadcn UI *(Phase 3)*
- **Orchestration:** Docker Compose — `web`, `frontend`, `db`, `redis`, `celery_worker`, `celery_beat` *(Phase 4)*

## Status

| Phase | Scope | State |
|---|---|---|
| 1 | Directory structure & DB design | Done |
| 2 | Core backend (models, JWT, serializers, viewsets, Celery, filters) | Done |
| 3 | Frontend setup & shell UI | Pending |
| 4 | API integration, docker-compose, verification | Pending |

## Backend

```
backend/
├── config/                  # settings (base/dev/prod/test), urls, celery, asgi/wsgi
└── apps/
    ├── common/              # TimeStampedModel, pagination, permissions, cache helpers
    ├── accounts/            # custom User (email login), JWT auth + token blacklist
    ├── catalog/             # Category, Product, ProductImage + Redis cache + signals
    ├── inventory/           # Warehouse, InventoryRecord, StockMovement + atomic services
    └── orders/              # Cart, Order (writable nested), Payment, Invoice + Celery tasks
```

### Local development (backend)

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env            # adjust values

# Run against the test settings (sqlite, no external services):
DJANGO_SETTINGS_MODULE=config.settings.test python manage.py migrate
python -m pytest
ruff check .

# Run against Postgres/Redis (dev settings):
export DJANGO_SETTINGS_MODULE=config.settings.dev
python manage.py migrate
python manage.py runserver
```

API docs (Swagger UI): `http://localhost:8000/api/docs/`

### Key features

- **Auth:** SimpleJWT access/refresh with rotation + blacklist-on-logout.
- **Throttling:** scoped rate limits on `auth`, `checkout`, `payment` endpoints.
- **Writable nested serializers:** `OrderSerializer.create/update` wrapped in `transaction.atomic()`.
- **N+1 elimination:** custom `ProductQuerySet.with_relations()` (`select_related`/`prefetch_related`).
- **Caching:** Redis-backed category tree & top-sellers, invalidated via Django signals.
- **Async:** Celery + Redis for PDF invoice generation, inventory deduction, and email dispatch.
- **Security (prod):** `SECURE_SSL_REDIRECT`, secure cookies, HSTS, strict CORS to the Next.js origin.
