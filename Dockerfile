FROM node:24-slim
WORKDIR /app

COPY env.d.ts env.d.ts
COPY vite.config.js vite.config.js
COPY package.json package-lock.json ./

RUN npm ci --ignore-scripts

COPY public/ ./public/
COPY src/ ./src/
COPY index.html ./index.html

RUN mkdir -p public/wasm && \
    cp node_modules/onnxruntime-web/dist/ort-wasm-*.wasm public/wasm/ && \
    cp node_modules/onnxruntime-web/dist/ort-wasm-*.mjs public/wasm/

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
