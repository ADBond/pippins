FROM node:24-slim
WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --ignore-scripts

COPY static/ ./static/
COPY src/ ./src/
COPY index.html ./index.html

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
