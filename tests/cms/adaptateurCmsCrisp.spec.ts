import {afterEach, before, beforeEach, describe, it, Mock, mock} from 'node:test';
import assert from 'assert';
import {AdaptateurCmsCrisp} from '../../src/cms/adaptateurCmsCrisp';
import axios from 'axios';

describe("L'adaptateur CMS Crisp", (contexteTest) => {
    describe("sur récupération d'un article", () => {
        let mockAxiosGet: Mock<any>;
        let reponseAxios = {
            data: {
                title: 'Un Titre',
                description: 'Une description',
                content: '# Un contenu markdown',
            }
        };

        beforeEach((contexteTest) => {
            if('mock' in contexteTest) {
                mockAxiosGet = contexteTest.mock.method(axios, "get", async () => {
                    return { data: { ...reponseAxios } }
                });
            }
        });

        afterEach((contexteTest) => {
            if('mock' in contexteTest) {
                contexteTest.mock.reset();
            }
        });

        it('utilise Axios pour faire un appel API', async () => {
            const adaptateurCmsCrisp = new AdaptateurCmsCrisp('ID_SITE', 'CLE_API');

            await adaptateurCmsCrisp.recupereArticle('ID_ARTICLE');

            assert.equal(mockAxiosGet.mock.calls.length, 1);
            const urlUtilisee = mockAxiosGet.mock.calls[0].arguments[0];
            const headerUtilise = mockAxiosGet.mock.calls[0].arguments[1]?.headers;
            assert.strictEqual(urlUtilisee, 'https://api.crisp.chat/v1/website/ID_SITE/helpdesk/locale/fr/article/ID_ARTICLE');
            assert.deepEqual(headerUtilise, {
                'X-Crisp-Tier': 'plugin',
                Authorization: 'Basic Q0xFX0FQSQ=='
            });
        });

        it("retourne le contenu de l'article", async () => {
            const adaptateurCmsCrisp = new AdaptateurCmsCrisp('ID_SITE', 'CLE_API');

            const reponse = await adaptateurCmsCrisp.recupereArticle('ID_ARTICLE');
            assert.equal(reponse.titre, "Un Titre");
            assert.equal(reponse.description, "Une description");
            assert.equal(reponse.contenuMarkdown, "# Un contenu markdown");
        });
    });
});