import { describe, it } from 'node:test';
import assert from 'assert';
import request from 'supertest';
import { creeServeurLab } from '../../src/serveur/serveurLab';

const ipClient = '123.123.123.123';
const ipAutreClient = '122.122.122.122';
const ipWaf = '1.1.1.1';

describe('Le serveur', () => {
  describe('filtre les IPs', () => {
    const app = creeServeurLab({
      reseau: {
        ipAutorisees: [ipWaf],
        trustProxy: 0,
        maxRequetesParMinute: 10000,
      },
    });
    app.get('/', (req, res) => {
      res.json({});
    });

    it('en rejettant les IPs non autorisées', async () => {
      const response = await request(app)
        .get('/')
        .set('X-Forwarded-For', `${ipClient}`);

      assert.equal(response.status, 403);
    });

    it('en acceptant les IPs autorisées', async () => {
      const response = await request(app)
        .get('/')
        .set('X-Forwarded-For', `${ipClient}, ${ipWaf}`);

      assert.equal(response.status, 200);
    });

    it("en rejetant les attaquants qui tentent de bidouiller l'en-tête X-Forwarded_For", async () => {
      const response = await request(app)
        .get('/')
        .set('X-Forwarded-For', `${ipWaf}, ${ipClient}`);

      assert.equal(response.status, 403);
    });
  });

  describe('limite le nombre de requêtes', () => {
    const app = creeServeurLab({
      reseau: {
        ipAutorisees: false,
        trustProxy: 1,
        maxRequetesParMinute: 1,
      },
    });
    app.get('/', (req, res) => {
      res.json({});
    });

    it("lorsqu'un utilisateur fait trop de requêtes", async () => {
      await request(app).get('/').set('X-Forwarded-For', `${ipClient}`);
      const response = await request(app)
        .get('/')
        .set('X-Forwarded-For', `${ipClient}`);

      assert.equal(response.status, 429);
    });

    it("mais pas lorsque les requêtes viennent d'utilisateurs différents", async () => {
      await request(app).get('/').set('X-Forwarded-For', `${ipClient}`);
      const response = await request(app)
        .get('/')
        .set('X-Forwarded-For', `${ipAutreClient}`);

      assert.equal(response.status, 200);
    });
  });
});
