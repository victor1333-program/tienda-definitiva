# Backups de Base de Datos

Este directorio contiene los backups de la base de datos PostgreSQL del proyecto Lovilike.

## Archivos

- `lovilike_dev_backup.sql`: Backup completo de la base de datos con datos y esquema
- `lovilike_dev_schema.sql`: Solo el esquema de la base de datos (sin datos)

## Restaurar desde Backup

Para restaurar la base de datos en un nuevo servidor:

```bash
# Restaurar backup completo
PGPASSWORD=tu_password psql -h localhost -U lovilike_user -d lovilike_db -f lovilike_dev_backup.sql

# O solo el esquema
PGPASSWORD=tu_password psql -h localhost -U lovilike_user -d lovilike_db -f lovilike_dev_schema.sql
```

## Crear Nuevos Backups

```bash
# Backup completo
PGPASSWORD=dev123 pg_dump -h localhost -U developer -d lovilike_dev -F p -f backups/nuevo_backup.sql

# Solo esquema
PGPASSWORD=dev123 pg_dump -h localhost -U developer -d lovilike_dev -F p --schema-only -f backups/nuevo_schema.sql
```

## Nota Importante

Los archivos de backup contienen datos sensibles y NO deben compartirse públicamente.
Estos archivos están excluidos del repositorio Git mediante .gitignore.
