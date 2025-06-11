-- 🗄️ Configuración PostgreSQL para Lovilike
-- Ejecutar como usuario postgres

-- Crear usuario para la aplicación
CREATE USER lovilike_user WITH PASSWORD 'tu_password_seguro_aqui';

-- Crear base de datos
CREATE DATABASE lovilike_db;

-- Dar permisos al usuario
GRANT ALL PRIVILEGES ON DATABASE lovilike_db TO lovilike_user;
GRANT ALL ON SCHEMA public TO lovilike_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO lovilike_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO lovilike_user;

-- Configurar extensiones útiles
\c lovilike_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Verificar conexión
\l