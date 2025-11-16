# Database Scripts

This directory contains scripts for database initialization and management.

## init-db.js

Node.js script that creates all required database tables, indexes, and default data for the Todo Telegram App.

### Usage

```bash
# Using npm script (recommended)
npm run db:init

# Or run directly
node scripts/init-db.js
```

### Requirements

- PostgreSQL database running
- `DATABASE_URL` environment variable set in `.env` file
- Node.js and npm installed

### What it does

1. **Creates tables:**
   - `users` - Telegram users
   - `projects` - Task projects
   - `todos` - Tasks
   - `user_settings` - User notification settings

2. **Creates indexes** for optimal performance:
   - User-based indexes
   - Date and priority indexes
   - Notification-related indexes

3. **Sets up default data:**
   - Creates "Inbox" project for existing users
   - Creates default notification settings for existing users

## init-db.sql

Pure SQL script that does the same as `init-db.js` but can be run directly with `psql`.

### Usage

```bash
# Using npm script
npm run db:init:sql

# Or run directly with psql
psql $DATABASE_URL -f scripts/init-db.sql
```

## Environment Variables

Make sure your `.env` file contains:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
```

## Notes

- The script is idempotent - it can be run multiple times safely
- Tables are created with `IF NOT EXISTS` to avoid conflicts
- Indexes are created with `IF NOT EXISTS` for the same reason
- Default data is only inserted for users that don't already have it

## Troubleshooting

### Connection Error
```
Error: connect ECONNREFUSED
```
- Make sure PostgreSQL is running
- Check DATABASE_URL format
- Verify database exists

### Permission Error
```
Error: permission denied for database
```
- Check database user permissions
- Make sure user can create tables

### SSL Error
```
Error: self signed certificate
```
- For local development, SSL is disabled
- For production, ensure proper SSL configuration