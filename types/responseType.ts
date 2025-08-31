export type responseType = {
    success: boolean,
    message?: string,
    data?:object
}


export interface uploadAuthInterface{
    token: string,
    expire: number,
    signature: string,
    publicKey: string
}