FROM node:20-bookworm

# Install Python + pip
RUN apt-get update && \
    apt-get install -y python3 python3-pip python3-venv && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Node dependencies
COPY package*.json ./
RUN npm install

# Copy all source code
COPY . .

# Install Python ML dependencies
RUN pip3 install --break-system-packages \
    flask flask-cors requests \
    tensorflow scikit-learn numpy pandas

EXPOSE 5000 5001

CMD ["npm", "start"]