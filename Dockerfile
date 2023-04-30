FROM node:latest

WORKDIR /app

COPY package.json .

RUN npm install
RUN npm install nodemon --save-dev

COPY . .

EXPOSE 3001

CMD ["npm", "run", "dev"]
