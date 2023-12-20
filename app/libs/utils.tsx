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

export const UPLOAD_URL = 'https://content.dropboxapi.com/2/files/upload';
export const SHARE_URL = 'https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings';
export const uploadToDropbox = async (data: Buffer, fileName: string) => {
    const secret = process.env.DROPBOX_KEY;
    const headers = {
        'Content-Type': 'application/octet-stream',
        'Authorization': `Bearer ${secret}`,
        'Dropbox-API-Arg': JSON.stringify({
            path: `/storage/${fileName}`,
            mode: 'add',
            autorename: true,
            mute: false,
        }),
    };

    try {
        const response = await (await fetch(UPLOAD_URL, {
            method: 'POST',
            headers,
            body: data,
        })).json();

        const shareHeaders = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${secret}`,
        };

        const shareData = {
            path: response.path_display,
            settings: {
                requested_visibility: 'public',
            },
        };

        const shareResponse = await (await fetch(SHARE_URL, {
            method: 'POST',
            headers: shareHeaders,
            body: JSON.stringify(shareData),
        })).json();

        return shareResponse.url.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
    } catch (error: any) {
        console.error('Error uploading file to Dropbox:', error.response.data);
        throw error;
    }
};
