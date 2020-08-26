/**
 * Gera uma nova data no futuro a partir da data do dia de hoje.
 * @param days um número em dias para gerar a nova data;
 */
const getDateFromNow = (days: number): Date => {
    const today = new Date();

    const timestamp = new Date().setDate(today.getDate() + days);

    return new Date(timestamp);
};

/**
 * Formata uma Data para um formato básico de datas, aaaa/mm/dd;
 * @param date timestamp relativo a alguma data;
 */
const formatBasicDate = (date: Date): string => {
    return `-${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
};

export { getDateFromNow, formatBasicDate };
