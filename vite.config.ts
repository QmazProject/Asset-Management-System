import { defineConfig } from "vite";

export default defineConfig({
    server: {
        host: true,
        allowedHosts: [
            "fatigued-lashon-nonostensively.ngrok-free.dev",
        ],
    },
});
