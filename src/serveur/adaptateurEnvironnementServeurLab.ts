import { ConfigurationServeurLab } from './serveurLab';

const trustProxy = () => {
  const trustProxyEnChaine = process.env.SERVEUR_TRUST_PROXY || '0';
  const trustProxyEnNombre = Number(trustProxyEnChaine);
  if (isNaN(trustProxyEnNombre)) {
    console.warn(
      `Attention ! SERVEUR_TRUST_PROXY positionné à ${trustProxyEnChaine}`
    );
    return trustProxyEnChaine;
  } else {
    return trustProxyEnNombre;
  }
};

const maxRequetesParMinute = () => {
  const maxEnChaine = process.env.SERVEUR_MAX_REQUETES_PAR_MINUTE || '600';
  const maxEnNombre = Number(maxEnChaine);
  if (isNaN(maxEnNombre)) {
    throw new Error(
      `SERVEUR_MAX_REQUETES_PAR_MINUTE n'est pas un nombre : ${maxEnChaine}`
    );
  } else {
    return maxEnNombre;
  }
};

export const adaptateurEnvironnementServeurLab =
  (): ConfigurationServeurLab => {
    return {
      reseau: {
        trustProxy: trustProxy(),
        maxRequetesParMinute: maxRequetesParMinute(),
        ipAutorisees:
          process.env.SERVEUR_ADRESSES_IP_AUTORISEES?.split(',') ?? false,
      },
    };
  };
