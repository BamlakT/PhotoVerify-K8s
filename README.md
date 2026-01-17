# PhotoVerify - QR Photo Verification

Une application web cloud-native pour sécuriser et vérifier l'authenticité de vos photos via QR Code.

## Fonctionnalités

- **Upload Direct** : Ajoutez des photos avec titre, date et description.
- **Génération Flash** : Crée automatiquement un QR code unique pour chaque image.
- **Vérification Public** : Page de vérification accessible via le QR pour prouver l'authenticité.
- **Gestion Galerie** : Visualisez toutes vos photos, téléchargez les QR codes ou supprimez les entrées.

## Architecture

```
                              ┌─────────────────┐
                              │    Browser      │
                              └────────┬────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                          Kubernetes Cluster (Minikube)                        │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                         Ingress Controller                               │ │
│  │                    (nginx - photoverify.local)                           │ │
│  └────────────────────────────────┬────────────────────────────────────────┘ │
│                                   │                                          │
│                                   ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                    Frontend Service (NodePort:30000)                     │ │
│  └────────────────────────────────┬────────────────────────────────────────┘ │
│                                   │                                          │
│                                   ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                          Frontend Pod                                    │ │
│  │                     (Next.js App - Port 3000)                           │ │
│  │   ┌─────────────────┐                    ┌─────────────────────────┐    │ │
│  │   │ Uploads Volume  │◄──────────────────►│  PersistentVolume       │    │ │
│  │   │ /app/public/    │                    │  (frontend-uploads-pvc) │    │ │
│  │   │ uploads         │                    │  500Mi                  │    │ │
│  │   └─────────────────┘                    └─────────────────────────┘    │ │
│  └────────────────────────────────┬────────────────────────────────────────┘ │
│                                   │                                          │
│                                   ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                  PostgreSQL Service (ClusterIP:5432)                     │ │
│  └────────────────────────────────┬────────────────────────────────────────┘ │
│                                   │                                          │
│                                   ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                         PostgreSQL Pod                                   │ │
│  │                    (postgres:15-alpine - Port 5432)                      │ │
│  │   ┌─────────────────┐                    ┌─────────────────────────┐    │ │
│  │   │ Data Volume     │◄──────────────────►│  PersistentVolume       │    │ │
│  │   │ /var/lib/       │                    │  (postgres-pvc)         │    │ │
│  │   │ postgresql/data │                    │  1Gi                    │    │ │
│  │   └─────────────────┘                    └─────────────────────────┘    │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │              HorizontalPodAutoscaler (frontend-hpa)                      │ │
│  │         Scales frontend: 1-5 replicas based on CPU/Memory               │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Request Flow
1. **Browser** → User accesses photoverify.local or NodePort
2. **Ingress** → Routes traffic to frontend-service
3. **Frontend Service** → Load balances to frontend pod(s)
4. **Frontend Pod** → Processes request, queries database
5. **PostgreSQL Service** → Routes to database pod
6. **PostgreSQL Pod** → Stores/retrieves data from PersistentVolume

## Installation Locale (Développement)

1. **Installer les dépendances** :
   ```bash
   npm install
   ```

2. **Configurer l'environnement** :
   Créez un fichier `.env` à la racine :
   ```env
   DATABASE_URL="postgresql://photoverify:photoverify123@localhost:5432/photoverify"
   NEXT_PUBLIC_BASE_URL="http://localhost:3000"
   ```

3. **Lancer PostgreSQL** (via Docker) :
   ```bash
   docker run -d --name postgres-dev \
     -e POSTGRES_USER=photoverify \
     -e POSTGRES_PASSWORD=photoverify123 \
     -e POSTGRES_DB=photoverify \
     -p 5432:5432 \
     postgres:15-alpine
   ```

4. **Lancer le serveur de développement** :
   ```bash
   npm run dev
   ```

5. **Accès** :
   Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

---

## Docker Compose (Multi-Container)

Lance l'application complète avec PostgreSQL :

```bash
docker-compose up --build
```

**Services déployés :**
- `postgres` : Base de données PostgreSQL (port 5432)
- `app` : Application Next.js (port 3000)

---

## Kubernetes (Minikube)

### Prérequis
- Minikube installé
- kubectl configuré
- Docker Desktop ou Docker Engine

### Déploiement

1. **Démarrer Minikube** :
   ```bash
   minikube start
   ```

2. **Configurer Docker pour Minikube** :
   ```bash
   # Linux/Mac
   eval $(minikube docker-env)
   
   # Windows PowerShell
   & minikube -p minikube docker-env --shell powershell | Invoke-Expression
   ```

3. **Build l'image Docker** :
   ```bash
   docker build -t photoverify-app:latest .
   ```

4. **Déployer sur Kubernetes** :
   ```bash
   cd k8s
   kubectl apply -f namespace.yaml
   kubectl apply -f postgres-secret.yaml
   kubectl apply -f configmap.yaml
   kubectl apply -f postgres-pv.yaml
   kubectl apply -f postgres-deployment.yaml
   kubectl apply -f postgres-service.yaml
   kubectl apply -f frontend-deployment.yaml
   kubectl apply -f frontend-service.yaml
   ```

5. **Vérifier le déploiement** :
   ```bash
   kubectl get pods -n photoverify
   kubectl get svc -n photoverify
   ```

6. **Accéder à l'application** :
   ```bash
   minikube service frontend-service -n photoverify
   ```

### Scripts de déploiement automatique

**PowerShell (Windows)** :
```powershell
cd k8s
.\deploy.ps1
```

**Bash (Linux/Mac)** :
```bash
cd k8s
chmod +x deploy.sh
./deploy.sh
```

---

## Structure des Fichiers Kubernetes

```
k8s/
├── namespace.yaml           # Namespace photoverify
├── postgres-secret.yaml     # Credentials PostgreSQL
├── configmap.yaml           # Configuration app
├── postgres-pv.yaml         # PersistentVolume + PVC (Database)
├── frontend-pv.yaml         # PersistentVolume + PVC (Uploads)
├── postgres-deployment.yaml # Deployment PostgreSQL
├── postgres-service.yaml    # Service ClusterIP
├── frontend-deployment.yaml # Deployment Frontend
├── frontend-service.yaml    # Service NodePort (30000)
├── ingress.yaml             # Ingress Controller (photoverify.local)
├── hpa.yaml                 # HorizontalPodAutoscaler
├── deploy.sh                # Script déploiement (Bash)
└── deploy.ps1               # Script déploiement (PowerShell)
```

### Ingress Access

Pour accéder via l'Ingress:

1. **Activer l'addon Ingress** :
   ```bash
   minikube addons enable ingress
   ```

2. **Démarrer le tunnel Minikube** :
   ```bash
   minikube tunnel
   ```

3. **Ajouter l'entrée hosts** (en tant qu'administrateur) :
   ```
   127.0.0.1 photoverify.local
   ```

4. **Accéder** : http://photoverify.local

---

## Structure Technique

- **Frontend** : Next.js 16, React 19, Tailwind CSS, Lucide React
- **Backend** : Next.js API Routes
- **Base de données** : PostgreSQL 15 (via pg client)
- **QR Code** : Bibliothèque `qrcode`
- **Stockage** : Dossier local `public/uploads`
- **Containerisation** : Docker multi-stage build
- **Orchestration** : Kubernetes (Deployment, Service, PV/PVC)

---

## Commandes Utiles

```bash
# Voir les logs d'un pod
kubectl logs -f deployment/frontend -n photoverify

# Accéder au shell d'un pod
kubectl exec -it deployment/postgres -n photoverify -- psql -U photoverify

# Supprimer tout le déploiement
kubectl delete namespace photoverify

# Rebuild après modifications
docker build -t photoverify-app:latest . && kubectl rollout restart deployment/frontend -n photoverify
```
