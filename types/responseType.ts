import { CommentInterface } from "../models/Comment";
import { postInterface } from "../models/Post"

export interface responseType {
    success: boolean,
    message?: string,
    data?: object,
    posts?: postInterface[];
    comments?: CommentForm[];
}


export interface uploadAuthInterface {
    token: string,
    expire: number,
    signature: string,
    publicKey: string
}

export interface updateProfileInterface {
    userId: string | undefined;
    image: string;
    firstName: string;
    lastName: string;
}

export interface CommentForm extends CommentInterface {
    page?: number;
    limit?:number;
    userData?: {
        username: string;
        image: string;
    }
}