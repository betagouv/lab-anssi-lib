# lab-anssi-lib
Une librairie de code mutualisé pour les produits du Lab. Innovation de l'ANSSI

## serveur

Un certain nombre de comportements standards sont intégrés dans `serveur/serveurLab`, en particulier
le filtrage IP (pour n'autoriser que les requêtes venant du waf) et le rate limit.

Pour l'utiliser, remplacez votre code de la forme :

```
const app = express();
app.get('/', (req, res) => {res.json({})});
```

Par un code de la forme :

```
const app = creeServeurLab({
  reseau: {
    ipAutorisees: [ipWaf],
    trustProxy: 0,
    maxRequetesParMinute: 500,
  },
});
app.get('/', (req, res) => {res.json({})});
```

La configuration serveur peut-être construite automatiquement à partir des variables d'environnement :

```
const config = configurationServeurLabEnvironnement();
const app = creeServeurLab(config);
app.get('/', (req, res) => {res.json({})});
```

Dans ce cas, vous devez positionner des variables d'environnement de la forme :

```
SERVEUR_TRUST_PROXY = # optionnel (0 par défaut) nombre de proxies en amont du service ou configuration plus fine de trust proxy, Cf.  https://expressjs.com/en/guide/behind-proxies.html
SERVEUR_MAX_REQUETES_PAR_MINUTE = # optionnel (600 par défaut) nombre maximum de requêtes par minute par IP
SERVEUR_ADRESSES_IP_AUTORISEES = # Seules ces IP seront autorisées. Les autres ne seront pas servies. Séparées par des ',' s'il y en a plusieurs. Supprimer la variable d'env pour désactiver le filtrage.
```