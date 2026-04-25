# PostgreSQL Setup

The backend expects this local PostgreSQL database:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=hospital_management
DB_USERNAME=postgres
DB_PASSWORD=newpassword
```

Run these one time from your terminal:

```bash
sudo pg_ctlcluster 16 main start
sudo -u postgres psql
```

Inside the `psql` prompt:

```sql
ALTER USER postgres WITH PASSWORD 'newpassword';
CREATE DATABASE hospital_management OWNER postgres;
\q
```

Then run Laravel migrations:

```bash
php artisan config:clear
php artisan migrate
php artisan db:seed
```
