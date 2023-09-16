dev:
    npm run dev

deploy: build
    npx wrangler pages deploy ./out

build:
    npm run build

watch:
    npx jest --watch

test:
    npx jest
