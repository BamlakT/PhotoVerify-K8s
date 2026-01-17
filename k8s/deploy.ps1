# PhotoVerify Kubernetes Deployment Script (PowerShell)
# This script deploys the entire application stack to Minikube

$ErrorActionPreference = "Stop"

Write-Host "=== PhotoVerify Kubernetes Deployment ===" -ForegroundColor Cyan

# Check if minikube is running
$minikubeStatus = minikube status 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Starting Minikube..." -ForegroundColor Yellow
    minikube start
}

# Use Minikube's Docker daemon
Write-Host "Configuring Docker to use Minikube's daemon..." -ForegroundColor Yellow
& minikube -p minikube docker-env --shell powershell | Invoke-Expression

# Build the frontend Docker image
Write-Host "Building frontend Docker image..." -ForegroundColor Yellow
docker build -t photoverify-app:latest ..

# Apply Kubernetes manifests in order
Write-Host "Creating namespace..." -ForegroundColor Yellow
kubectl apply -f namespace.yaml

Write-Host "Creating secrets..." -ForegroundColor Yellow
kubectl apply -f postgres-secret.yaml

Write-Host "Creating ConfigMap..." -ForegroundColor Yellow
kubectl apply -f configmap.yaml

Write-Host "Creating PersistentVolume and PersistentVolumeClaim..." -ForegroundColor Yellow
kubectl apply -f postgres-pv.yaml

Write-Host "Deploying PostgreSQL..." -ForegroundColor Yellow
kubectl apply -f postgres-deployment.yaml
kubectl apply -f postgres-service.yaml

Write-Host "Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
kubectl wait --for=condition=ready pod -l app=postgres -n photoverify --timeout=120s

Write-Host "Deploying Frontend..." -ForegroundColor Yellow
kubectl apply -f frontend-deployment.yaml
kubectl apply -f frontend-service.yaml

Write-Host "Waiting for Frontend to be ready..." -ForegroundColor Yellow
kubectl wait --for=condition=ready pod -l app=frontend -n photoverify --timeout=120s

Write-Host ""
Write-Host "=== Deployment Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "To access the application:" -ForegroundColor Cyan
Write-Host "  minikube service frontend-service -n photoverify"
Write-Host ""
Write-Host "Or use: minikube service frontend-service -n photoverify --url"
Write-Host ""
Write-Host "Check pod status: kubectl get pods -n photoverify" -ForegroundColor Cyan
Write-Host "Check services: kubectl get svc -n photoverify" -ForegroundColor Cyan
