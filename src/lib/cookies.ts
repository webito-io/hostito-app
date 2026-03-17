import { getCookie, setCookie } from "cookies-next";

export function setCookies(name: string, value: string) {
    setCookie(name, value, {
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
    });
}

export function getCookies(name: string) {
    return getCookie(name, {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
    });
}