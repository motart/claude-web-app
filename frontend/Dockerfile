FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci --silent

COPY . ./
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]