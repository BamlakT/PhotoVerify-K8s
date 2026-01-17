#!/bin/bash

# PhotoVerify Kubernetes Deployment Script
# This script deploys the entire application stack to Minikube

set -e

echo "=== PhotoVerify Kubernetes Deployment ==="

# Check if minikube is running
if ! minikube status > /dev/null 2>&1; then
    echo "Starting Minikube..."
    minikube start
fi

# Use Minikube's Docker daemon
echo "Configuring Docker to use Minikube's daemon..."
eval $(minikube docker-env)

# Build the frontend Docker image
echo "Building frontend Docker image..."
docker build -t photoverify-app:latest ..

# Apply Kubernetes manifests in order
echo "Creating namespace..."
kubectl apply -f namespace.yaml

echo "Creating secrets..."
kubectl apply -f postgres-secret.yaml

echo "Creating ConfigMap..."
kubectl apply -f configmap.yaml

echo "Creating PersistentVolume and PersistentVolumeClaim..."
kubectl apply -f postgres-pv.yaml

echo "Deploying PostgreSQL..."
kubectl apply -f postgres-deployment.yaml
kubectl apply -f postgres-service.yaml

echo "Waiting for PostgreSQL to be ready..."
kubectl wait --for=condition=ready pod -l app=postgres -n photoverify --timeout=120s

echo "Deploying Frontend..."
kubectl apply -f frontend-deployment.yaml
kubectl apply -f frontend-service.yaml

echo "Waiting for Frontend to be ready..."
kubectl wait --for=condition=ready pod -l app=frontend -n photoverify --timeout=120s

echo ""
echo "=== Deployment Complete ==="
echo ""
echo "To access the application:"
echo "  minikube service frontend-service -n photoverify"
echo ""
echo "Or use: minikube service frontend-service -n photoverify --url"
echo ""
echo "Check pod status: kubectl get pods -n photoverify"
echo "Check services: kubectl get svc -n photoverify"
