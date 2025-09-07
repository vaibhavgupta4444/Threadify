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


export interface videoFormData {
    userId: string,
    title: string,
    description: string,
    mediaUrl: string
}


export interface likeFormData {
    postId: string;
    userId: string;
}


export interface CommentForm {
    _id?: string;
    postId: string;
    userId?: string;
    parentId?:string;
    content?: string;
    createdAt?: Date;
    page?: number;
    limit?:number;
    userData?: {
        username: string;
        image: string;
    }
}