# Build stage
FROM node:22-alpine AS builder
WORKDIR /app

# Instalar dependencias primero (mejor cache)
COPY package.json package-lock.json ./
RUN npm ci

# Copiar código fuente
COPY . .

# Variables de entorno para el build de Vite
ARG VITE_INSFORGE_URL
ARG VITE_INSFORGE_ANON_KEY

# Compilar la aplicación
RUN npm run build

# Production stage - solo nginx sirviendo estáticos
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
