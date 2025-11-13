# ============================================================
# Dockerfile.prod - React Frontend para Cloud Run
# ============================================================
# Multi-stage build para optimizar tamaño final
# Stage 1: Compilar React
# Stage 2: Servir con nginx
# ============================================================

# ============================================================
# STAGE 1: Builder - Compilar aplicación React
# ============================================================
FROM node:18-alpine as builder

# Metadata
LABEL stage=builder
LABEL description="Build stage for React application"

# Directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias exactamente como se especifican
# npm ci es preferible a npm install en CI/CD
RUN npm install --omit=dev --audit=false --prefer-offline

# Copiar código fuente
COPY . .

# Build de la aplicación React
# CI=false evita que los warnings causen error
ENV CI=false
RUN npm run build

# Verificar que el build fue exitoso
RUN if [ ! -d "build" ]; then echo "Build directory not found!"; exit 1; fi
RUN echo "Build size: $(du -sh build | cut -f1)"

# ============================================================
# STAGE 2: Production - Servir con nginx
# ============================================================
FROM nginx:1.25-alpine

# Metadata
LABEL maintainer="MusicStream Team"
LABEL version="1.0"
LABEL description="MusicStream Lite Frontend - React SPA"

# Variables de entorno
ENV NGINX_PORT=3000
ENV NODE_ENV=production

# Crear usuario no-root para seguridad
RUN addgroup -g 101 -S nginx 2>/dev/null || true && adduser -S -D -H -u 101 -h /var/cache/nginx -s /sbin/nologin -c "nginx user" nginx 2>/dev/null || true \
    adduser -S -D -H -u 101 -h /var/cache/nginx -s /sbin/nologin -c "nginx user" nginx

# Copiar configuración nginx personalizada
COPY nginx.conf /etc/nginx/nginx.conf
# COPY nginx-default.conf /etc/nginx/conf.d/default.conf

# Copiar build de React desde el stage builder
COPY --from=builder --chown=nginx:nginx /app/build /usr/share/nginx/html

# Crear directorio de caché de nginx
RUN mkdir -p /var/cache/nginx && \
    chown -R nginx:nginx /var/cache/nginx && \
    mkdir -p /var/run/nginx && \
    chown -R nginx:nginx /var/run/nginx

# Permisos correctos
RUN chmod -R 755 /usr/share/nginx/html && \
    chown -R nginx:nginx /usr/share/nginx/html

# Crear archivo de health check
RUN echo '{"status":"ok"}' > /usr/share/nginx/html/health

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/health || exit 1

# Cambiar al usuario nginx (no root)
USER nginx

# Puerto que expone Cloud Run
EXPOSE 3000

# Logs
ENV NGINX_ACCESS_LOG=/dev/stdout
ENV NGINX_ERROR_LOG=/dev/stderr

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;", "-c", "/etc/nginx/nginx.conf"]

# ============================================================
# NOTAS IMPORTANTES
# ============================================================
#
# 1. MULTI-STAGE BUILD:
#    - Stage 1 (builder): Instala deps y compila React
#    - Stage 2 (production): Solo contiene nginx + build
#    - Resultado: Imagen mucho más pequeña (~50 MB vs 500 MB)
#
# 2. SEGURIDAD:
#    - Usuario no-root (nginx)
#    - Permisos restrictivos
#    - Sin binarios innecesarios
#
# 3. CLOUD RUN:
#    - Puerto 3000 es el que espera Cloud Run
#    - Usa /dev/stdout para logs
#    - Health check es importante
#
# 4. OPTIMIZACIONES:
#    - Alpine Linux (~50 MB base)
#    - npm ci en lugar de npm install
#    - Build cache optimizado
#
# 5. VARIABLES DE ENTORNO:
#    - Se definen en cloudbuild.yml
#    - Se inyectan al runtime del contenedor
#
# ============================================================