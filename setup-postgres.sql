-- Script para configurar PostgreSQL para SIGESDA
-- Ejecutar como usuario postgres: psql -f setup-postgres.sql

-- Crear usuario sigesda_user
CREATE USER sigesda_user WITH PASSWORD 'SiGesda2024!';

-- Crear base de datos asociacion_musical
CREATE DATABASE asociacion_musical OWNER sigesda_user;

-- Otorgar permisos
GRANT ALL PRIVILEGES ON DATABASE asociacion_musical TO sigesda_user;

-- Conectar a la nueva base de datos y otorgar permisos de esquema
\c asociacion_musical;
GRANT ALL ON SCHEMA public TO sigesda_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO sigesda_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO sigesda_user;

-- Verificar la creación
\du sigesda_user;
\l asociacion_musical;