# Surron Control — TORP 500

Application mobile React Native / Expo pour contrôler ta Surron équipée du contrôleur **TORP 500** via Bluetooth.

Interface inspirée de l'app Stark Varg — thème sombre racing, données temps réel, modes de conduite personnalisables.

---

## Fonctionnalités

### Dashboard (temps réel)
- **Vitesse** instantanée (km/h) — affichage grand format
- **Puissance moteur** (kW) — jauge arc circulaire
- **RPM moteur** — jauge arc circulaire
- **Batterie** — barre de progression avec tension (V) et %
- **Courant** de décharge / régénératif (A)
- **Températures** moteur & contrôleur avec alertes visuelles
- **Position accélérateur** (0-100%)
- **Odomètre** total et distance trajet
- **Durée** du trajet

### Modes de conduite
| Mode | Puissance | Regen | TC | Usage |
|------|-----------|-------|----|-------|
| ECO | 40% | 8/10 | 8/10 | Économie, débutant |
| TRAIL | 70% | 5/10 | 5/10 | Polyvalent quotidien |
| ENDURO | 90% | 3/10 | 3/10 | Off-road performance |
| RACE | 100% | 1/10 | 1/10 | Piste, performance max |
| CUSTOM | Libre | Libre | Libre | Paramètres personnalisés |

### Carte de puissance
- Éditeur graphique interactif — **glisse les points** pour modifier la courbe accélérateur → puissance
- Courbe indépendante par mode
- Envoi direct au TORP 500

### Paramètres avancés
- Puissance maximale (%)
- Limiteur de vitesse (km/h)
- Freinage régénératif (0-10)
- Contrôle de traction (0-10)
- Comportement au démarrage (doux / normal / agressif)
- Protection batterie basse (tension de coupure)
- Limites de température moteur & contrôleur
- Reset du trajet

---

## Installation

### Prérequis
- Node.js 18+
- `npm install -g expo-cli eas-cli`
- **Pour iOS** : Mac avec Xcode 15+ et un compte Apple Developer (gratuit suffit pour le déploiement sur ton propre iPhone)
- **Pour Android** : Android Studio ou un appareil en mode débogage USB

> **Important** : Le Bluetooth BLE ne fonctionne pas dans Expo Go. Un **build natif est obligatoire**.

---

### Option 1 — Build local (Mac requis pour iOS)

```bash
cd surron-app
npm install

# iOS — ouvre Xcode et déploie sur ton iPhone
npx expo run:ios --device

# Android
npx expo run:android
```

Pour iOS, Xcode s'ouvrira automatiquement. Dans Xcode :
1. Sélectionne ton iPhone dans la liste des appareils
2. Change le **Team** dans `Signing & Capabilities` (ton compte Apple)
3. Appuie sur **Run** ▶

---

### Option 2 — EAS Build (recommandé, pas besoin de Mac)

EAS Build compile dans le cloud. Tu reçois un `.ipa` (iOS) ou `.apk` (Android) à installer directement.

```bash
npm install -g eas-cli
eas login          # crée un compte Expo gratuit si besoin

cd surron-app
npm install

# Build iOS (envoi sur TestFlight ou installation via lien)
eas build --platform ios --profile preview

# Build Android APK
eas build --platform android --profile preview
```

Pour iOS sans compte Apple Developer payant, utilise le profil `development` avec un device enregistré :
```bash
eas device:create          # enregistre l'UDID de ton iPhone
eas build --platform ios --profile development
```

---

## Connexion au TORP 500

1. **Allume ta Surron** — le TORP 500 démarre automatiquement
2. **Active le mode BLE** sur le TORP 500 :
   - Consulte le manuel TORP pour la procédure d'activation Bluetooth
   - Le LED BLE du contrôleur doit clignoter
3. **Ouvre l'app** → appuie sur **"Rechercher"**
4. **Sélectionne** ton `TORP-XXXXX` dans la liste
5. La connexion s'établit automatiquement

### Permissions requises
- **Bluetooth** — connexion BLE
- **Localisation** — requis par Android pour le scan BLE

---

## Architecture

```
surron-app/
├── App.tsx                          # Point d'entrée
├── src/
│   ├── services/
│   │   ├── TorpProtocol.ts          # Protocole BLE TORP 500 (frames, parsing)
│   │   └── BluetoothService.ts      # Gestion connexion BLE + polling temps réel
│   ├── screens/
│   │   ├── ConnectScreen.tsx        # Scan & connexion Bluetooth
│   │   ├── DashboardScreen.tsx      # Télémétrie temps réel
│   │   ├── RideModesScreen.tsx      # Sélection mode de conduite
│   │   ├── PowerMapScreen.tsx       # Éditeur courbe de puissance
│   │   └── SettingsScreen.tsx       # Paramètres avancés
│   ├── components/
│   │   ├── ArcGauge.tsx             # Jauge arc circulaire SVG
│   │   └── BatteryBar.tsx           # Barre batterie animée
│   ├── navigation/
│   │   └── AppNavigator.tsx         # Navigation onglets
│   └── theme/
│       └── index.ts                 # Couleurs, typographie, espacements
```

## Protocole TORP 500 (BLE)

- **Service** : Nordic UART Service `6e400001-b5a3-f393-e0a9-e50e24dcca9e`
- **TX** (écriture vers contrôleur) : `6e400002-...`
- **RX** (notifications du contrôleur) : `6e400003-...`
- **Format frame** : `[AA][CMD][LEN][DATA...][CRC8]`
- **Polling** : requête `GET_REALTIME` toutes les 500ms

---

## Compatibilité

| Plateforme | Support |
|------------|---------|
| Android 10+ | ✅ Complet |
| iOS 13+ | ✅ Complet |
| Expo Go | ⚠️ BLE limité (build natif recommandé) |
