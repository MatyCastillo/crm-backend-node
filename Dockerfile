FROM node:20.11.1

WORKDIR /backend
COPY package.json . 
RUN npm install

COPY . .
CMD npm run dev
