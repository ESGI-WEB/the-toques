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
export const TOKEN_URL = 'https://api.dropboxapi.com/oauth2/token';
export const uploadToDropbox = async (data: Buffer, fileName: string) => {
    try {
        const secret = await getAccessTokenFromRefreshToken();
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
        console.error('Error uploading file to Dropbox');
        console.error(error);
        throw error;
    }
};

const getAccessTokenFromRefreshToken = async () => {
    const requestBody = `grant_type=refresh_token&refresh_token=${process.env.DROPBOX_REFRESH_TOKEN}&client_id=${process.env.DROPBOX_CLIENT_ID}&client_secret=${process.env.DROPBOX_CLIENT_SECRET}`;

    const response = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: requestBody,
    });

    if (!response.ok) {
        throw new Error(`Error refreshing access token: ${response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
};

