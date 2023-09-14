declare global {
    namespace Express {
        interface AuthInfo {}
        interface User {}
        interface Request {
            user?: User | undefined;
        }
    }
}

export {}
