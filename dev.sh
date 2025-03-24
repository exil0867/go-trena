#!/bin/bash

tmux new-session -d -s backend "go run -C backend main.go"
tmux new-window -t backend "pnpm -C ./frontend run dev"
tmux attach-session -t backend
