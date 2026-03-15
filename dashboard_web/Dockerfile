# Étape 1 : build de l'app React
FROM node:18 AS build

# Crée le dossier de travail
WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation des dépendances
RUN npm install

# Copie du code
COPY . .

# Build optimisé pour la prod
RUN npm run build

# Étape 2 : serveur Nginx pour servir l'app
FROM nginx:alpine

# Copie du build vers Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copie config custom si besoin
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
