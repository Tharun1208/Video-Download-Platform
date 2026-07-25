import React, { useState } from "react";
import { Download, X, Crown } from "lucide-react";
import { downloadVideo } from "../../api/downloadApi";

function DownloadButton({ video }) {
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleDownload = async () => {
        try {
            setLoading(true);

            setMessage("Downloading video...");
            setShowPopup(true);

            const response = await downloadVideo(video._id);

            if (response.data.success) {
                setTimeout(() => {
                    setMessage("✅ Download completed successfully.");
                    setLoading(false);
                }, 2000);
            }
        } catch (error) {
            setLoading(false);

            setMessage(
                error.response?.data?.message || "Download failed."
            );
        }
    };

    return (
        <>
            <button
                onClick={handleDownload}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30 active:scale-95"
            >
                <Download size={20} />

                {loading ? "Downloading..." : "Download"}
            </button>

            {showPopup && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">

                    <div className="bg-gray-900 border border-gray-800 text-white rounded-2xl p-6 w-96 shadow-xl">

                        <div className="flex justify-between items-center">

                            <h2 className="text-xl font-bold">
                                Download Status
                            </h2>

                            <button
                                onClick={() => setShowPopup(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <X size={22} />
                            </button>

                        </div>
                        <div className="mt-5 text-gray-300">

                            {loading ? (

                                <div className="flex flex-col items-center py-4">

                                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>

                                    <p className="mt-4 text-blue-400">
                                        Downloading video...
                                    </p>

                                </div>

                            ) : (

                                <>
                                    {(message.toLowerCase().includes("premium") ||
                                        message.toLowerCase().includes("limit")) && (

                                            <div className="flex items-center gap-2 text-yellow-400 mb-3">

                                                <Crown size={18} />

                                                Premium Required

                                            </div>

                                        )}

                                    <p>{message}</p>

                                </>

                            )}

                        </div>

                        <button
                            disabled={loading}
                            onClick={() => setShowPopup(false)}
                            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white py-3 rounded-lg transition"
                        >
                            {loading ? "Downloading..." : "OK"}
                        </button>

                    </div>

                </div>
            )}
        </>
    );
}

export default DownloadButton;