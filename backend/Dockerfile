# Pruebas con Docker

# Indicamos el software base para el programa
FROM node:20
# Indicamos cuál es el directorio de trabajo
RUN mkdir -p /app
WORKDIR /app
# Instalamos paquetes con npm
COPY package*.json ./
RUN npm install
# Usamos copy para obtener los archivos de la carpeta y copiarlos allí
COPY . .
# Comando para ejecutar la aplicación
CMD ["npm", "start"]
# Nos conectamos a un puerto a exponer
# EXPOSE 80
EXPOSE 3000