dev:
    npm run dev

deploy: build
    npx wrangler pages deploy ./out

build:
    npm run build
