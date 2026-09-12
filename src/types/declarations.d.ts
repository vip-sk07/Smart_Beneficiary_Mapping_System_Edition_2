declare module "qrcode-terminal" {
    export function generate(
        input: string,
        opts?: { small?: boolean },
        cb?: (qrcode: string) => void
    ): void;
    export function setErrorLevel(error: string): void;
}
