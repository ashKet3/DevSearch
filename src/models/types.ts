export interface IProfile {
    id: string,
    name?: string,
    username?: string,
    email?: string,
    about?: string,
    photo?: string,
    coverPhoto?: string,
    followers?: IProfile[],
    following?: IProfile[]
}

export interface IProject {
    id: string,
    name: string,
    about: string,
    admin: string,
    photo: string
    url: string
    likes: string[],
    dislikes: string[]
}

export type Message = {
    id: string,
    text: string,
    timestamp: string,
    sender: IProfile,
    receiver: IProfile,
    replyTo?: Message
}
