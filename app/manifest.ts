import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        "name": "Ứng dụng học tập trực tuyến",
        "short_name": "LearningApp",
        "start_url": "/",
        "id": "LearningApp",
        "display": "standalone",
        "description": "Ứng dụng học tập trực tuyến giúp bạn nâng cao kỹ năng ngôn ngữ một cách hiệu quả và thú vị.",
        "icons": [
            {
                "purpose": "maskable",
                "sizes": "512x512",
                "src": "/mascot_512.png",
                "type": "image/png"
            },
            {
                "purpose": "any",
                "sizes": "512x512",
                "src": "/mascot_512.png",
                "type": "image/png"
            }
        ],
        "screenshots": [
            {
                "src": "/screenshot.png",
                "type": "image/png",
                "sizes": "1080x1920",
                "form_factor": "narrow"
            }
        ],
    }
}