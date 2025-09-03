import { videoInterface } from "../models/video"

export interface responseType{
    success: boolean,
    message?: string,
    data?:object,
    videos?:videoInterface[];
}


export interface uploadAuthInterface{
    token: string,
    expire: number,
    signature: string,
    publicKey: string
}

export interface updateProfileInterface{
    userId:string | undefined;
    profilePic:string;
    firstName:string;
    lastName:string;
}