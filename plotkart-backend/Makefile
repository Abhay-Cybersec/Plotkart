.PHONY: install dev start migrate seed test clean docker-up docker-down

install:
	npm install

dev:
	npm run dev

start:
	npm start

migrate:
	npm run migrate

seed:
	npm run seed

test:
	npm test

clean:
	rm -rf node_modules package-lock.json
	npm install

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-logs:
	docker-compose logs -f

docker-rebuild:
	docker-compose down
	docker-compose build --no-cache
	docker-compose up -d

setup: install migrate seed
	@echo "Setup complete! Run 'make dev' to start."

help:
	@echo "PlotKart Backend - Available Commands:"
	@echo "  make install       - Install dependencies"
	@echo "  make dev          - Start development server"
	@echo "  make migrate      - Run database migrations"
	@echo "  make seed         - Seed database"
	@echo "  make docker-up    - Start Docker containers"
