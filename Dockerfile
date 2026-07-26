FROM node:24.18.0-alpine
WORKDIR appdata/BOTcchi
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run buiild
CMD ["npm", "run", "start"]
LABEL authors="taigussy"