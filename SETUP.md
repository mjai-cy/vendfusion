# Oppora Clone - Setup Instructions

## Backend Setup (Python FastAPI)

### 1. Navigate to backend directory
```bash
cd backend
```

### 2. Create virtual environment
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Set up environment variables (optional)
```bash
cp .env.example .env
# Edit .env with your settings
```

### 5. Run the server
```bash
python main.py
```

The API will be available at:
- **API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Frontend**: http://localhost:8000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Leads
- `GET /api/leads/` - List leads
- `POST /api/leads/` - Create lead
- `POST /api/leads/bulk` - Bulk import leads
- `PUT /api/leads/{id}` - Update lead
- `DELETE /api/leads/{id}` - Delete lead

### Campaigns
- `GET /api/campaigns/` - List campaigns
- `POST /api/campaigns/` - Create campaign
- `POST /api/campaigns/{id}/send` - Send campaign
- `GET /api/campaigns/{id}/stats` - Get stats

### AI
- `POST /api/ai/generate-email` - Generate personalized email
- `POST /api/ai/generate-bulk` - Generate multiple emails

### Mailboxes
- `GET /api/mailboxes/` - List mailboxes
- `POST /api/mailboxes/` - Add mailbox
- `POST /api/mailboxes/{id}/warmup` - Start warmup

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard stats
- `GET /api/dashboard/performance` - Get performance metrics

## Frontend

The frontend HTML file is located at `../index.html`. The backend serves it automatically when you visit http://localhost:8000.

## Database

Uses SQLite by default. The database file `oppora.db` will be created automatically on first run.

To use PostgreSQL instead:
1. Install `psycopg2-binary`
2. Update `DATABASE_URL` in database.py
