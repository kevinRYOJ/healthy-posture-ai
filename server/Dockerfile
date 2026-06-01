FROM node:20-bookworm

RUN apt-get update && \
    apt-get install -y python3 python3-pip

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN pip3 install --break-system-packages flask flask-cors requests

EXPOSE 5000

CMD ["npm", "start"]