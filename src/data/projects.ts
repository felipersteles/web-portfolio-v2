// TRANSFORMAR EM JSON
// e preencher

export const projects: ProjectDTO[] = [
    {
        id: 0,
        name: "LightForms",
        description: "My first SaaS developed in Nestjs and Nextjs/React",
        tags: ["react", "nestjs", "react", "ga action"],

        demo: "http://lightforms.io",
        star: true,
    },
    {
        id: 1,
        name: "Computer Graphics Explained",
        description: "A Webgl explanation showing some projects I developed. Enjoy it!",
        tags: ["webgl", "javascript", "css"],
        demo: "https://felipersteles.github.io/computer-graphics/",
        github: "https://github.com/felipersteles/computer-graphics",
        star: true,
    },
    {
        id: 11,
        name: "Flying News",
        description: "A Nextjs application that consumes the New York Times API.",
        tags: ["nextjs", "typescript", "chakra.ui"],
        demo: "https://news.felipeteles.com",
        github: "https://github.com/felipersteles/flying-news",
        star: true,

    },
    {
        id: 2,
        name: "SaTELEStes",
        description:
            "Site that I made using to show the stuffs the NASA post on a public api. Thank you nasa!",
        tags: ["react", "css", "styledComponents"],

        demo: "https://satelestes.netlify.app/",
        github: "https://github.com/felipersteles/saTELEStes",
        star: true,
    },
    {
        id: 3,
        name: "Learning Algorithms",
        description: "Some algorithms that I use daily. Site that I use to enforce learning.",
        tags: ["html", "javascript", "css"],

        demo: "https://felipersteles.github.io/learning-algorithms/",
        github: "https://github.com/felipersteles/learning-algorithms",
        star: true
    },
    {
        id: 5,
        name: "Financial control",
        description: "App that can show your extract of some spends or funds.",
        tags: ["react", "css", "html"],

        demo: "https://felipersteles.github.io/controle-financeiro-react/",
        github: "https://github.com/felipersteles/controle-financeiro-react",
        star: false,
    },
    {
        id: 6,
        name: "Snake game",
        description:
            "One of my firsts projects and now you can play it in this web site.",
        tags: ["css", "html", "js"],

        demo: "https://felipersteles.github.io/jogo-da-cobrinha/",
        github: "https://github.com/felipersteles/jogo-da-cobrinha",
        star: false,
    },
    {
        id: 7,
        name: "Spotify Clone",
        description:
            "Using the API of spotify to learn about redux. It doesnt have sound but you can control your spotify account by the app.",
        tags: ["react", "context", "reducer"],

        demo: "https://spotify-felipersteles.netlify.app/",
        github: "https://github.com/felipersteles/spotify-react",
        star: true,
    },
    {
        id: 8,
        name: "Jogo de damas",
        description:
            "Checkers game in a brazilian way. Not finished yet but I am doing without any content.",
        tags: ["html", "css", "javascript"],

        demo: "https://felipersteles.github.io/jogo-de-damas/",
        github: "https://github.com/felipersteles/jogo-de-damas",
        star: false,
    },
    {
        id: 9,
        name: "Tic Tac Toe",
        description:
            "We call it Jogo da velha in brazil. Just a project that I made when I was learning html, css and js basics.",
        tags: ["react", "css", "styledComponents"],

        demo: "https://felipersteles.github.io/TicTacToe/",
        github: "https://github.com/felipersteles/TicTacToe",
        star: false,
    },
    {
        id: 10,
        name: "A cat",
        description: "Just to improve the css knowledge",
        tags: ["css", "html"],

        demo: "https://felipersteles.github.io/gatinho/",
        github: "https://github.com/felipersteles/gatinho",
        star: false,
    },
];

export type ProjectDTO = {
    id: number;
    name: string;
    description: string;
    tags: string[];
    demo: string;
    github?: string;
    star: boolean;
};
