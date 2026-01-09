declare module "yt-search" {
    interface Video {
        title: string;
        url: string;
        timestamp: string;
        duration: string;
        seconds: number;
        image: string;
        views: number;
        ago: string;
        author: {
            name: string;
            url: string;
        };
        type: string;
    }

    interface Result {
        videos: Video[];
        playlists: any[];
        accounts: any[];
    }

    function ytSearch(search: string): Promise<Result>;
    export = ytSearch;
}
