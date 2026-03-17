import { getCookie, setCookie, deleteCookie } from "cookies-next";

export function setCookies(name: string, value: string) {
    setCookie(name, value, {
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    });
}

export function getCookies(name: string) {
    return getCookie(name, {
        path: '/',
    });
}

export function removeCookies(name: string) {
    deleteCookie(name, {
        path: '/',
    });
}