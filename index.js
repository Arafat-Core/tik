import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/api/search", async (req, res) => {
  try {
    const { keyword, cursor } = req.query;

    if (!keyword) {
      return res.status(400).json({
        error: "Missing keyword parameter"
      });
    }

    const response = await axios.post(
      "https://www.tikwm.com/api/feed/search",
      new URLSearchParams({
        keywords: keyword,
        count: 12,
        cursor: cursor || 0,
        web: 1,
        hd: 1
      }),
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
          "Accept": "application/json, text/javascript, */*; q=0.01",
          "Content-Type":
            "application/x-www-form-urlencoded; charset=UTF-8",
          "Origin": "https://www.tikwm.com",
          "Referer": "https://www.tikwm.com/en/",
          "X-Requested-With": "XMLHttpRequest"
        },
        timeout: 20000
      }
    );

    const videos = response.data?.data?.videos || [];

    const formatted = videos.map(video => ({
      videoUrl: `https://www.tikwm.com${video.play}`,
      title: video.title
    }));

    return res.json({
      status: true,
      total: formatted.length,
      cursor: response.data?.data?.cursor || 0,
      hasMore: response.data?.data?.hasMore || false,
      results: formatted
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      error: "Fetch failed",
      details: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
