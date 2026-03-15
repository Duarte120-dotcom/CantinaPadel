# 🎾 Cantina Pádel

Sistema de gestión de cantina para torneos de pádel.

## Deploy en Vercel (2 minutos)

### Opción A — Sin instalar nada (recomendado)

1. Subí la carpeta a GitHub:
   - Entrá a github.com → New repository → "cantina-padel"
   - Arrastrá todos los archivos de esta carpeta

2. Conectá con Vercel:
   - Entrá a vercel.com → New Project
   - Importá el repo de GitHub
   - Hacé click en Deploy ✅

### Opción B — Desde la terminal

```bash
# Instalar dependencias
npm install

# Probar en local
npm run dev

# Deploy directo a Vercel
npx vercel --prod
```

## Usuarios demo

| Email | Contraseña | Rol |
|-------|-----------|-----|
| admin@padel.com | 1234 | Admin |
| maria@padel.com | 1234 | Colaborador |

> ⚠️ Cambiá las contraseñas antes de usar en producción (sección Equipo → Editar).

## Sesión

La sesión se mantiene activa por **2 horas** tras el login. Al cerrar y reabrir el navegador dentro de ese plazo, no es necesario volver a iniciar sesión.

## Notas

- Los datos se guardan en `localStorage` del navegador.
- Para base de datos compartida entre múltiples dispositivos, conectar Supabase reemplazando la capa `storage`.
