# Client Deployment Guide

This guide explains how to run the project on a client machine using Docker.

## Prerequisites
- **Docker Desktop** installed and running.
- **Git** (optional, if cloning).

## Installation & Running

1. **Unzip** the project folder (or clone from git).
2. Open a terminal (PowerShell or Command Prompt) inside the project folder.
3. Run the following command to build and start the application:

   ```bash
   docker-compose up -d --build
   ```

4. Wait for the containers to start. The initial build may take a few minutes.
5. Once running, access the application at:
   - **Frontend**: [http://localhost:5173](http://localhost:5173)
   - **Backend API**: [http://localhost:3001](http://localhost:3001)
   - **Database Management (phpMyAdmin)**: [http://localhost:8080](http://localhost:8080) (User: `root`, Password: `rootpassword`)

## Database Initialization
The database is automatically initialized with the provided data (`mysql-init/init.sql`) on the **first run**. Use the provided credentials to log in.

## Troubleshooting
- **Database Connection Error**: If the app fails to connect, wait a minute and it should retry automatically.
- **Port Conflicts**: Ensure ports `3001`, `5173`, `8080`, and `3307` are not in use.

## Stopping the Application
To stop the application, run:
```bash
docker-compose down
```
