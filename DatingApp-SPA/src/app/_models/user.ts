import { Photo } from './photo';

export interface User {
    // Mandatory property.
    id: number;
    username: string;
    gender: string;
    age: number;
    knownAs: string;
    created: Date;
    lastActive: any;
    city: string;
    country: string;
    photoUrl: string;

    // Optional property (it should go after mandatory always else we get error)
    interests?: string;
    introduction?: string;
    lookingFor?: string;
    photos?: Photo[];
}
