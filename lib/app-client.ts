import { UserInterface } from "../models/User";
import { responseType, updateProfileInterface, uploadAuthInterface } from "../types/responseType";
import { videoFormData } from "../types/videoFormData";

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

    async uploadAuth(){
        return this.Fetch<uploadAuthInterface>("/upload-auth");
    }

    async getVideos<T = responseType>(){
        return this.Fetch<T>('/videos');
    }

    async createVideo<T = responseType>(videoData: videoFormData) {
        return this.Fetch<T>("/videos", {
            method: "POST",
            body: videoData
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
}

export const apiClient = new ApiClient();