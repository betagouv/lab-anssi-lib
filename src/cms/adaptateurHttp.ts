export interface AdaptateurHttp {
    ressourceExiste(url: string): Promise<boolean>;
}

export const fabriqueAdaptateurHttp = (): AdaptateurHttp => ({
    ressourceExiste: async (url: string): Promise<boolean> => {
        const response = await fetch(url);
        return response.ok;
    }
});
