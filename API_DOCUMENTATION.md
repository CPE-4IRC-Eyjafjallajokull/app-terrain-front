# Configuration API - app-terrain-front

## Base URL
```
https://api.sdmis.mathislambert.fr
```

Documentation complète : https://api.sdmis.mathislambert.fr/docs

## Routes API utilisées par l'application

### QG (Quartier Général)

#### Véhicules
- **GET** `/qg/vehicles` - Liste tous les véhicules avec leur état
  - Proxyfié via: `/api/vehicles`
  - Retourne: `QGVehiclesListRead` avec array de véhicules

- **POST** `/qg/vehicles/{vehicle_immatriculation}/status` - Met à jour le statut d'un véhicule
  - Proxyfié via: `/api/vehicles/[vehicleId]/status`

- **POST** `/qg/vehicles/{vehicle_immatriculation}/position` - Met à jour la position d'un véhicule

#### Incidents
- **GET** `/qg/incidents` - Liste tous les incidents
  - Proxyfié via: `/api/incidents`
  - Retourne: Array de `QGIncidentSnapshot`

- **POST** `/qg/incidents/new` - Déclare un nouvel incident
  
- **GET** `/qg/incidents/{incident_id}` - Détails d'un incident
  - Proxyfié via: `/api/incidents/[incidentId]`
  - Retourne: `QGIncidentRead`

- **GET** `/qg/incidents/{incident_id}/situation` - Situation d'un incident (phases, ressources, victimes)
  - Proxyfié via: `/api/incidents/[incidentId]/situation`
  - Retourne: `QGIncidentSituationRead`

- **GET** `/qg/incidents/{incident_id}/engagements` - Engagements véhicules d'un incident
  - Proxyfié via: `/api/incidents/[incidentId]/engagements`
  - Retourne: `QGIncidentEngagementsRead`

- **GET** `/qg/incidents/{incident_id}/casualties` - Victimes d'un incident
  - Proxyfié via: `/api/incidents/[incidentId]/casualties`
  - Retourne: `QGCasualtiesRead`

- **GET** `/qg/live` - Flux SSE des événements en temps réel
  - Proxyfié via: `/api/events`

### Terrain

#### Points d'intérêt
- **GET** `/terrain/interest-points/{kind_id}` - Liste des points d'intérêt par type
  - Proxyfié via: `/api/interest-points/by-kind/[kindId]`
  - Utilisé pour récupérer les centres de secours

### Référentiels

#### Véhicules
- **GET** `/vehicles/types` - Types de véhicules
  - Proxyfié via: `/api/vehicles/types`

- **GET** `/vehicles/statuses` - Statuts de véhicules
  - Proxyfié via: `/api/vehicles/statuses`

#### Victimes (Casualties)
- **GET** `/casualties/types` - Types de victimes
  - Proxyfié via: `/api/casualties/types`

- **GET** `/casualties/statuses` - Statuts de victimes
  - Proxyfié via: `/api/casualties/statuses`

- **POST** `/casualties` - Créer une victime
  - Proxyfié via: `/api/casualties`

- **PATCH** `/casualties/{casualty_id}` - Mettre à jour une victime
  - Proxyfié via: `/api/casualties/[casualtyId]`

#### Points d'intérêt
- **GET** `/interest-points/kinds` - Types de points d'intérêt
  - Proxyfié via: `/api/interest-points/kinds`

### Géocodage
- **GET** `/geo/address/reverse` - Géocodage inverse (coordonnées → adresse)
  - Proxyfié via: `/api/geocode/reverse`
  - Paramètres: `lat`, `lon`

## Codes de statut véhicule

D'après l'analyse de l'API, les codes de statut suivants sont utilisés :

- `DISPONIBLE` / `AVAILABLE` - Véhicule disponible
- `EN_ROUTE` - En route vers l'incident
- `SUR_PLACE` - Sur place
- `INTERVENTION` - En intervention

## Structure des données principales

### Vehicle (QGVehicleSummary)
```typescript
{
  vehicle_id: string;
  immatriculation: string;
  type: QGVehicleTypeRef;
  status: QGVehicleStatusRef;
  station: QGBaseInterestPoint;
  position?: QGVehiclePosition;
  availability: QGVehicleAvailability;
}
```

### Incident (QGIncidentSnapshot)
```typescript
{
  incident_id: string;
  started_at: string;
  ended_at: string | null;
  address: string;
  city: string;
  zipcode: string;
  latitude: number;
  longitude: number;
  active_phases: QGActivePhase[];
  casualties_summary: QGCasualtiesSummary;
  resources_summary: QGResourcesSummary;
}
```

### InterestPoint
```typescript
{
  interest_point_id: string;
  interest_point_kind_id: string;
  name: string;
  address: string;
  city: string;
  zipcode: string;
  latitude: number;
  longitude: number;
}
```

## Authentification

Toutes les requêtes nécessitent un token JWT Bearer obtenu via Keycloak :
```
Authorization: Bearer <access_token>
```

Le token est géré automatiquement par NextAuth et injecté dans chaque requête via le proxy API.

## Configuration locale

Variables d'environnement nécessaires (`.env.local`) :
```bash
# Auth Keycloak
KEYCLOAK_ISSUER=https://sso.example.com/realms/my-realm
KEYCLOAK_CLIENT_ID=frontend-client
KEYCLOAK_CLIENT_SECRET=your-secret
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
AUTH_TRUST_HOST=true

# API Backend
API_URL=https://api.sdmis.mathislambert.fr
```

## Notes importantes

1. **Proxy API** : Toutes les routes `/api/*` sont proxifiées vers l'API backend via `/lib/api-proxy.ts`
2. **Cache** : Utiliser `cache: "no-store"` pour les données en temps réel
3. **SSE** : Le endpoint `/api/events` fournit un flux Server-Sent Events pour les mises à jour temps réel
4. **CORS** : Le proxy Next.js gère automatiquement les problèmes CORS
