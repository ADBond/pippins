start-app:
	docker compose up -d --build

stop-app:
	docker compose down -v
