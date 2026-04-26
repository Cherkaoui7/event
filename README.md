# Rapport de Projet : DOMINATORES

**DOMINATORES** est une plateforme haut de gamme de gestion et d'organisation d'événements (mariages, galas, réceptions) conçue avec une approche "Premium". Le projet se distingue par son simulateur 3D immersif et son tunnel de vente fluide allant de la personnalisation au paiement de l'acompte.

---

## 🛠️ Stack Technique

Le projet repose sur une architecture moderne, découplée et hautement performante :

### Backend
- **Framework :** Laravel 10 (PHP)
- **Base de données :** SQLite (configurable vers MySQL/PostgreSQL)
- **Architecture :** API RESTful avec authentification basée sur les tokens (Sanctum).

### Frontend
- **Framework :** React 18 + Vite.js
- **Routage :** React Router DOM
- **Rendu 3D :** Three.js via `@react-three/fiber` et `@react-three/drei`
- **Styling :** CSS-in-JS (Vanilla) sans dépendance lourde pour garantir la pureté du code et des performances maximales.

---

## ✨ Fonctionnalités Clés Implémentées

### 1. Simulateur de Salle 3D Ultra-Réaliste (`Simulator3D.jsx`)
C'est le cœur de l'innovation du projet. Le simulateur permet au client de visualiser et configurer sa salle en temps réel.
- **Rendu Procédural :** Génération mathématique des tables, des chaises, et de l'architecture marocaine (Arches, Plafond à croisillons, Estrade).
- **Dollhouse View (Anti-occlusion) :** Les murs extérieurs disparaissent automatiquement lorsque la caméra tourne, offrant une vue 360° parfaite sans blocage visuel.
- **Capture Photo 3D :** Le client peut prendre une photo (Snapshot) de sa configuration 3D, qui est générée directement via le WebGL.

### 2. Gestion de l'Art de la Table et Traiteur (`CateringSection.jsx`)
- Sélection dynamique du menu (Entrées, Plats, Desserts).
- Tarification calculée instantanément en fonction du nombre d'invités.
- Intégration de packs tout-inclus pour simplifier la réservation.

### 3. Planificateur de Tables (`SeatingChart.jsx`)
- Calcul algorithmique du nombre de tables nécessaires selon le Layout choisi (ex: Table ronde = 8 pers, Table rectangulaire = 10 pers).
- Génération d'une interface interactive permettant de saisir et d'assigner le nom de chaque invité à un siège précis.

### 4. Tunnel de Vente et Devis PDF (`EventSummary.jsx`)
- **Génération de Devis :** Création d'une vue d'impression optimisée via `@media print`. En un clic, l'application cache l'interface web pour générer un PDF propre et professionnel.
- **Paiement d'Acompte (`PaymentModal.jsx`) :** Simulation d'une passerelle de paiement exigeant un acompte de 30% pour verrouiller la réservation, avec animation de traitement bancaire.

---

## ⚡ Optimisations et Performances

Afin de garantir une expérience utilisateur irréprochable malgré la lourdeur inhérente au rendu 3D, plusieurs stratégies ont été déployées :

1. **Code Splitting (Lazy Loading) :** Le chargement de Three.js et du simulateur 3D a été différé (`React.lazy()`). Les pages classiques (Accueil, Login) se chargent instantanément sans télécharger le moteur 3D.
2. **Bundle Splitting (Vite) :** Configuration personnalisée de `vite.config.js` pour séparer `three.js` et `react` dans des "chunks" distincts, optimisant drastiquement la mise en cache par le navigateur.
3. **Optimisation SEO :** Mise à jour du `index.html` avec les balises meta nécessaires et le "preconnect" des polices Google Fonts pour éviter le clignotement de texte (FOUT).

---


*Rapport généré le 26 Avril 2026 par Abdessamad Cherkaoui.*
