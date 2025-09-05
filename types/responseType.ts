import { postInterface } from "../models/Post"

export interface responseType{
    success: boolean,
    message?: string,
    data?:object,
    posts?:postInterface[];
}


export interface uploadAuthInterface{
    token: string,
    expire: number,
    signature: string,
    publicKey: string
}

export interface updateProfileInterface{
    userId:string | undefined;
    image:string;
    firstName:string;
    lastName:string;
}


export interface videoFormData{
    userId : string,
    title:string,
    description:string,
    mediaUrl:string
}