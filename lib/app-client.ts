import { UserInterface } from "../models/User";
import { likeFormData, responseType, updateProfileInterface, uploadAuthInterface, videoFormData } from "../types/responseType";


export type userFormData = Omit<UserInterface, "_id">;

type fetchOptions = {
    method?: "GET" | "POST" | "PUT" | "DELETE",
    body?: any,
    headers?: Record<string, string>
}


class ApiClient {

    private async Fetch<T>(
        endpoint: String,
        options: fetchOptions = {}
    ): Promise<T> {
        const { method = "GET", body, headers = {} } = options;

        const defaultHeader = {
            "content-type": "application/json",
            ...headers
        }

        const fetchOptions: RequestInit = {
            method,
            headers: defaultHeader,
        };

        if (body && method !== "GET") {
            fetchOptions.body = JSON.stringify(body);
        }

        const response = await fetch(`/api${endpoint}`, fetchOptions);

        if (!response.ok) {
            throw new Error(await response.text());
        }

        return response.json();
    }

    async register<T = responseType>(userData: userFormData) {
        // console.log(userData);
        return this.Fetch<T>("/auth/register", {
            method: "POST",
            body: userData
        })
    }

    async checkUsername<T = responseType>(username:string){
        return this.Fetch<T>("/check-username", {
            method: "POST",
            body: username
        })
    }

    async updateProfile<T = responseType>(userData :updateProfileInterface){
         return this.Fetch<T>("/update-profile", {
            method: "PUT",
            body: userData
        })
    }

        async uploadAuth(){
        return this.Fetch<uploadAuthInterface>("/upload-auth");
    }


    //Post related section

    async getPosts<T = responseType>(){
        return this.Fetch<T>('/posts');
    }

    async createPost<T = responseType>(videoData: videoFormData) {
        return this.Fetch<T>("/posts", {
            method: "POST",
            body: videoData
        })
    }

    async likePost<T = responseType>(data: likeFormData){
        return this.Fetch<T>("/likes",{
            method: "POST",
            body: data
        })
    }
}

export const apiClient = new ApiClient();