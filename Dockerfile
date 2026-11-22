FROM node:20-alpine AS base

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV PORT=3000

RUN npm run build

EXPOSE 3000

CMD ["npm", "start", "--", "-p", "3000"]
