import React, { useEffect, useState } from "react";
import DownloadCard from "../components/downloads/DownloadCard";
import { getDownloadHistory } from "../api/downloadApi";

function Downloads() {
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDownloads();
  }, []);

  const fetchDownloads = async () => {
    try {
      const response = await getDownloadHistory();

      if (response.data.success) {
        setDownloads(response.data.downloads);
      }
    } catch (error) {
      console.error("Failed to fetch downloads", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">

      {/* Header */}

      <div className="flex flex-col md:flex-row justify-between items-center mb-8">

        <div>

          <h1 className="text-4xl font-bold">
            My Downloads
          </h1>

          <p className="text-gray-400 mt-2">
            Access all your downloaded videos in one place.
          </p>

        </div>

        <div className="mt-4 md:mt-0 bg-blue-600/20 border border-blue-500 text-blue-400 px-5 py-2 rounded-full transition-all duration-300 hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-500/30">

          {downloads.length} Videos Downloaded

        </div>

      </div>

      {/* Download Cards */}

      <div className="space-y-6">

        {downloads.length > 0 ? (
          downloads.map((download) => (
            <DownloadCard
              key={download._id}
              video={download}
            />
          ))
        ) : (
          <div className="text-center text-gray-400 py-10">
            No downloads found.
          </div>
        )}

      </div>

    </div>
  );
}

export default Downloads;