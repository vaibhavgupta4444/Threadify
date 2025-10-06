import { likeInterface } from "../models/Like";
import { postInterface } from "../models/Post";
import { UserInterface } from "../models/User";
import { CommentForm, responseType, updateProfileInterface, uploadAuthInterface } from "../types/responseType";


export type userFormData = Omit<UserInterface, "_id">;

type fetchOptions = {
    method?: "GET" | "POST" | "PUT" | "DELETE",
    body?: unknown,
    headers?: Record<string, string>
}


class ApiClient {

    private async Fetch<T>(
        endpoint: string,
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

    async checkUsername<T = responseType>(username: string) {
        return this.Fetch<T>("/check-username", {
            method: "POST",
            body: username
        })
    }

    async updateProfile<T = responseType>(userData: updateProfileInterface) {
        return this.Fetch<T>("/update-profile", {
            method: "PUT",
            body: userData
        })
    }

    async uploadAuth() {
        return this.Fetch<uploadAuthInterface>("/upload-auth");
    }


    //Post related section

    async getPosts<T = responseType>(data:{page:number, limit?: number}) {
        const query = new URLSearchParams({
            page: (data.page ?? 1).toString(),
            limit: (data.limit ?? 10).toString(),
        });
        return this.Fetch<T>(`/posts?${query.toString()}`);
    }

    async createPost<T = responseType>(videoData: postInterface) {
        return this.Fetch<T>("/posts", {
            method: "POST",
            body: videoData
        })
    }

    async likePost<T = responseType>(data: likeInterface) {
        return this.Fetch<T>("/likes", {
            method: "POST",
            body: data
        })
    }

    async createComment<T = responseType>(data: CommentForm) {
        return this.Fetch<T>("/comment", {
            method: "POST",
            body: data
        })
    }

    async getComments<T = responseType>(data: CommentForm) {
        const query = new URLSearchParams({
            postId: typeof data.postId === "string" ? data.postId : data.postId.toString(),
            page: (data.page ?? 1).toString(),
            limit: (data.limit ?? 10).toString(),
        });

        return this.Fetch<T>(`/comment?${query.toString()}`, {
            method: "GET",
        });
    }
}

export const apiClient = new ApiClient();