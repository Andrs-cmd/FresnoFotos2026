FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
# En local, corremos 'dev', no el build de nginx
CMD ["npm", "run", "dev", "--", "--host"]