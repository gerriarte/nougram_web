# Nougram Backend

FastAPI backend for the Agency Profitability Platform.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Configure environment variables in `.env`

3. Run migrations:
```bash
alembic upgrade head
```

4. Start server:
```bash
uvicorn main:app --reload
```

## Project Structure

- `app/models/` - SQLAlchemy database models
- `app/schemas/` - Pydantic schemas for validation
- `app/api/v1/endpoints/` - API endpoint handlers
- `app/core/` - Core configuration (database, settings)

## Modules

1. **Costs** (`app/api/v1/endpoints/costs.py`)
   - Fixed costs management
   - Blended cost rate calculation

2. **Team** (`app/api/v1/endpoints/team.py`)
   - Team member management
   - Salary and billable hours tracking

3. **Services** (`app/api/v1/endpoints/services.py`)
   - Service catalog
   - Margin target configuration

4. **Quotes** (`app/api/v1/endpoints/quotes.py`)
   - Quote calculation logic
   - Real-time cost/price/margin calculation

5. **Projects** (`app/api/v1/endpoints/projects.py`)
   - Project and quote management

6. **Insights** (`app/api/v1/endpoints/insights.py`)
   - Dashboard KPIs
   - AI advisor integration

7. **Integrations** (`app/api/v1/endpoints/integrations.py`)
   - Google Sheets sync
   - Apollo.io search
   - Google Calendar integration

## Environment Variables

Required variables:
- `DATABASE_URL`
- `SECRET_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `APOLLO_API_KEY`
- `OPENAI_API_KEY` or `GOOGLE_AI_API_KEY`

## Development

- Use async SQLAlchemy for all database operations
- All business logic must be in backend
- Never expose API keys to frontend
- Use Pydantic for all request/response validation



