FROM node:22.18.0-alpine
WORKDIR /mnt/user/appdata/BOTcchi
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "run", "start"]
LABEL authors="taigussy"