FROM golang:1.21-alpine

WORKDIR /app
COPY . .

RUN go mod download
RUN go build -o search

EXPOSE 8080

CMD ["./search"]
