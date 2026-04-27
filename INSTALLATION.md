# Guide d'Installation / Installation Guide

Ce document explique comment cloner et installer le projet **DOMINATORES** sur votre machine locale.
*This document explains how to clone and install the **DOMINATORES** project on your local machine.*

---

## 🇫🇷 Français

### Prérequis
Avant de commencer, assurez-vous d'avoir installé les éléments suivants sur votre machine :
- **PHP** (v8.1 ou supérieure)
- **Composer** (Gestionnaire de dépendances PHP)
- **Node.js** (v16 ou supérieure) & **npm** (Gestionnaire de paquets JavaScript)
- **Git**

### Étapes d'installation

#### 1. Cloner le projet
Ouvrez votre terminal et exécutez la commande suivante :
```bash
git clone <URL_DU_DEPOT>
cd event
```
*(Remplacez `<URL_DU_DEPOT>` par l'URL réelle de votre dépôt Git)*

#### 2. Configuration du Backend (Laravel)
Ouvrez un terminal et placez-vous dans le dossier `backend` :
```bash
cd backend
```

Installez les dépendances PHP :
```bash
composer install
```

Créez une copie du fichier de configuration :
```bash
cp .env.example .env
```

Générez la clé d'application Laravel :
```bash
php artisan key:generate
```

Configurez la base de données (SQLite par défaut) :
Assurez-vous que la base de données SQLite existe. Sur Windows ou Linux, vous pouvez créer le fichier vide via :
```bash
# Sur Windows (PowerShell)
New-Item -Path database -Name database.sqlite -ItemType File

# Sur Linux/Mac
touch database/database.sqlite
```
Vérifiez que votre fichier `.env` dans le backend contient bien `DB_CONNECTION=sqlite` et pointe vers le bon fichier s'il nécessite un chemin absolu.

Exécutez les migrations pour créer les tables de la base de données :
```bash
php artisan migrate
```

Lancez le serveur de développement backend :
```bash
php artisan serve
```
*Le backend sera accessible sur `http://localhost:8000`.*

#### 3. Configuration du Frontend (React + Vite)
Ouvrez un **nouveau** terminal (laissez le serveur backend tourner) et placez-vous dans le dossier `frontend` :
```bash
cd frontend
```

Installez les dépendances Node.js :
```bash
npm install
```

Lancez le serveur de développement frontend :
```bash
npm run dev
```
*Le frontend sera accessible sur `http://localhost:5173`. Vous pouvez maintenant ouvrir cette URL dans votre navigateur.*

---

## 🇬🇧 English

### Prerequisites
Before you begin, ensure you have the following installed on your machine:
- **PHP** (v8.1 or higher)
- **Composer** (PHP dependency manager)
- **Node.js** (v16 or higher) & **npm** (JavaScript package manager)
- **Git**

### Installation Steps

#### 1. Clone the repository
Open your terminal and run the following command:
```bash
git clone <REPOSITORY_URL>
cd event
```
*(Replace `<REPOSITORY_URL>` with your actual Git repository URL)*

#### 2. Backend Setup (Laravel)
Open a terminal and navigate to the `backend` directory:
```bash
cd backend
```

Install PHP dependencies:
```bash
composer install
```

Create a copy of the environment file:
```bash
cp .env.example .env
```

Generate the Laravel application key:
```bash
php artisan key:generate
```

Configure the database (SQLite is default):
Make sure the SQLite database file exists. You can create an empty file with:
```bash
# On Windows (PowerShell)
New-Item -Path database -Name database.sqlite -ItemType File

# On Linux/Mac
touch database/database.sqlite
```
Check that your `.env` file in the backend has `DB_CONNECTION=sqlite`.

Run database migrations to create the tables:
```bash
php artisan migrate
```

Start the backend development server:
```bash
php artisan serve
```
*The backend will be available at `http://localhost:8000`.*

#### 3. Frontend Setup (React + Vite)
Open a **new** terminal (keep the backend server running) and navigate to the `frontend` directory:
```bash
cd frontend
```

Install Node.js dependencies:
```bash
npm install
```

Start the frontend development server:
```bash
npm run dev
```
*The frontend will be available at `http://localhost:5173`. You can now open this URL in your browser.*
