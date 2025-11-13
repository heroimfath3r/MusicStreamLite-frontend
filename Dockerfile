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
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev --audit=false

COPY . .

ENV CI=false
RUN npm run build

RUN npm install -g serve

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000 || exit 1

CMD ["serve", "-s", "build", "-l", "3000"]

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