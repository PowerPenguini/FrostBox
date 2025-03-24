IMAGE_NAME=migrate/migrate

migrationnew:
	docker run --rm -v $(PWD)/migrations:/migrations $(IMAGE_NAME) create -ext sql -dir /migrations $(name)

.PHONY: migrationnew