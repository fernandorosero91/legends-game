# Build stage
FROM node:22-alpine AS builder
WORKDIR /app

# Instalar dependencias primero (mejor cache)
COPY package.json package-lock.json ./
RUN npm ci

# Copiar código fuente
COPY . .

# Variables de entorno para el build de Vite
ARG VITE_INSFORGE_BASE_URL
ARG VITE_INSFORGE_ANON_KEY
ARG VITE_INSFORGE_PROJECT_ID
ARG VITE_INSFORGE_PROJECT_NAME
ARG VITE_INSFORGE_REGION
ARG VITE_APP_NAME
ARG VITE_APP_VERSION

# Compilar la aplicación
RUN npm run build

# Production stage - solo nginx sirviendo estáticos
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
