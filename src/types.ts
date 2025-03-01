export type Form = {
    id: string;
    username: string;
    title: string;
    height: string;
    status: "ENABLED" | "DISABLED" | "DELETED";
    created_at: string;
    updated_at: string;
    last_submission: string | null;
    new: string;
    count: string;
    type: "LEGACY" | "CARD";
    favorite: "0" | "1";
    archived: "0" | "1";
    url: string;
};