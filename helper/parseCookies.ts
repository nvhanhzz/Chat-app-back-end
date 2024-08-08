const parseCookies = (cookies: string): Record<string, string> => {
    return cookies
        .split(';')
        .map(cookie => cookie.split('='))
        .reduce((acc, [name, value]) => {
            acc[name.trim()] = decodeURIComponent(value);
            return acc;
        }, {} as Record<string, string>);
};

export default parseCookies;