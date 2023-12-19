export const SEASONS = {
    spring: {
        icon: '🌸',
        title: 'Nos recettes de printemps',
        name: 'printemps',
    },
    summer: {
        icon: '🌞',
        title: 'Nos recettes d\'été',
        name: 'été',
    },
    autumn: {
        icon: '🍂',
        title: 'Nos recettes d\'automne',
        name: 'automne',
    },
    winter: {
        icon: '☃️',
        title: 'Nos recettes d\'hiver',
        name: 'hiver',
    }
}

export function getCurrentSeason() {
    const month = new Date().getMonth();
    if (month >= 3 && month <= 5) return SEASONS.spring;
    if (month >= 6 && month <= 8) return SEASONS.summer;
    if (month >= 9 && month <= 11) return SEASONS.autumn;
    return SEASONS.winter;
}