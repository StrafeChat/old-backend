# ⚠️ Warning:

**Strafe `Backend` and all other projects related to this such as `Frontend, CDN, etc.` are still under heavy development. We reccommend that you not try to use it for personal use until development has progressed more and bugs are less likely to happen.\_**

# Strafe Backend

## Setup Locally

```bash
# Clone the repo
git clone https://github.com/StrafeChat/frontend

# Install all dependencies
pnpm i

# run the backend
pnpm run dev
```

## Environment Variables

The backend uses environment variables so we can easily reuse strings such as the url for the api and more. You will need to create a .env file in the root of the backend folder with the following format, feel free to replace anything that you need to.

```dosini
# URL for the CDN.
CDN_URL=http://localhost:6969
# PORT for the Backend.
PORT=443

# Address for PostgreSQL.
DB_HOST=127.0.0.1
# PORT for PostgreSQL.
DB_PORT=5433
# Username for the PostgreSQL database user.
DB_USER=postgres
# Password for the PostgreSQL database user.
DB_PASSWORD=password
# The database to use in PostgreSQL.
DB_DATABASE=strafe
```

## Routes

Currently the backend supports the following routes
**POST** `/v1/auth/login` - Used for logging.
**POST** `/v1/auth/register` - User for creating an account.
**GET** `/v1/users/@me` = Used to get your personal user data.